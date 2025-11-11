import express, { Request, Response } from 'express'
import cors from 'cors'
import { Pool } from 'pg'
import * as fs from 'fs'
import * as path from 'path'
import { hashPassword, generateRandomPassword } from './auth.js'
import { v4 as uuidv4 } from 'uuid'
import { createAuthRoutes } from './authRoutes.js'
import { createUserRoutes } from './userRoutes.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
// Configure CORS to allow requests from the reverse proxy and deployed domains
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    // Allow all etdofresh.com subdomains and localhost for development
    const allowedPatterns = [
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
      /^https?:\/\/.*\.etdofresh\.com$/,
    ]

    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin))
    callback(null, isAllowed)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.use(express.json())

// Database connection with error handling
let pool: Pool | null = null
let dbAvailable = false

function initPool() {
  const dbUrl = process.env.DATABASE_URL

  if (!dbUrl) {
    console.warn('⚠️  No DATABASE_URL environment variable set')
    console.warn('⚠️  Database functionality will be disabled')
    console.warn('⚠️  Set DATABASE_URL to enable session persistence')
    return null
  }

  try {
    pool = new Pool({ connectionString: dbUrl })

    // Test the connection
    pool.on('error', (err) => {
      console.error('❌ Database connection error:', err)
      dbAvailable = false
    })

    return pool
  } catch (error) {
    console.error('❌ Failed to initialize database pool:', error)
    return null
  }
}

// Initialize database schema
async function initDatabase() {
  if (!pool) {
    console.log('⚠️  Skipping database initialization (no pool available)')
    return
  }

  try {
    // Create sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT NOT NULL,
        request TEXT NOT NULL,
        repo VARCHAR(255) NOT NULL,
        environment VARCHAR(50) NOT NULL,
        output TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
    `)

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'free',
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `)

    console.log('✅ Database schema initialized')
    dbAvailable = true

    // Create default admin user if none exists
    await createDefaultAdmin()
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    console.error('❌ Sessions will not be persisted until database is available')
    dbAvailable = false
  }
}

// Create default admin user
async function createDefaultAdmin() {
  if (!pool || !dbAvailable) {
    return
  }

  try {
    // Check if any admin users exist
    const result = await pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`)
    const adminCount = parseInt(result.rows[0].count)

    if (adminCount === 0) {
      // Generate a random password
      const defaultPassword = generateRandomPassword()
      const passwordHash = await hashPassword(defaultPassword)
      const adminId = uuidv4()

      // Create the admin user
      await pool.query(`
        INSERT INTO users (id, email, password_hash, role, name)
        VALUES ($1, $2, $3, $4, $5)
      `, [adminId, 'admin@example.com', passwordHash, 'admin', 'Admin User'])

      console.log('')
      console.log('🔐 ═══════════════════════════════════════════════════════')
      console.log('🔐 DEFAULT ADMIN USER CREATED')
      console.log('🔐 ═══════════════════════════════════════════════════════')
      console.log('🔐 Email:    admin@example.com')
      console.log(`🔐 Password: ${defaultPassword}`)
      console.log('🔐 ═══════════════════════════════════════════════════════')
      console.log('🔐 ⚠️  IMPORTANT: Change this password immediately!')
      console.log('🔐 ═══════════════════════════════════════════════════════')
      console.log('')
    }
  } catch (error) {
    console.error('❌ Error creating default admin user:', error)
  }
}

// In-memory session storage fallback
const inMemorySessions: Map<string, Session> = new Map()

// In-memory user storage fallback
const inMemoryUsers: Map<string, any> = new Map()

// Session interface
interface Session {
  id: string
  name: string
  request: string
  repo: string
  environment: string
  output: string
  created_at?: string
  updated_at?: string
}

// Create in-memory admin user
async function createInMemoryAdmin() {
  // Check if admin already exists
  const hasAdmin = Array.from(inMemoryUsers.values()).some(u => u.role === 'admin')

  if (!hasAdmin) {
    const defaultPassword = generateRandomPassword()
    const passwordHash = await hashPassword(defaultPassword)
    const adminId = uuidv4()
    const now = new Date().toISOString()

    const adminUser = {
      id: adminId,
      email: 'admin@example.com',
      password_hash: passwordHash,
      role: 'admin',
      name: 'Admin User',
      created_at: now,
      updated_at: now
    }

    inMemoryUsers.set(adminId, adminUser)
    // Also index by email for easy lookup
    inMemoryUsers.set(`email:${adminUser.email}`, adminUser)

    console.log('')
    console.log('🔐 ═══════════════════════════════════════════════════════')
    console.log('🔐 IN-MEMORY ADMIN USER CREATED')
    console.log('🔐 ═══════════════════════════════════════════════════════')
    console.log('🔐 Email:    admin@example.com')
    console.log(`🔐 Password: ${defaultPassword}`)
    console.log('🔐 ═══════════════════════════════════════════════════════')
    console.log('🔐 ⚠️  IMPORTANT: This is temporary and will be lost on restart!')
    console.log('🔐 ⚠️  Set DATABASE_URL for persistent user storage')
    console.log('🔐 ═══════════════════════════════════════════════════════')
    console.log('')
  }
}

// API Routes
// Note: Routes don't include /api prefix because reverse proxy handles that

// Get all sessions
app.get('/sessions', async (req: Request, res: Response) => {
  try {
    if (dbAvailable && pool) {
      const result = await pool.query(
        'SELECT * FROM sessions ORDER BY created_at DESC'
      )
      res.json(result.rows)
    } else {
      // Use in-memory storage as fallback
      const sessions = Array.from(inMemorySessions.values())
        .sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime()
          const dateB = new Date(b.created_at || 0).getTime()
          return dateB - dateA
        })
      res.json(sessions)
    }
  } catch (error) {
    console.error('Error fetching sessions:', error)
    // Fallback to in-memory on database error
    const sessions = Array.from(inMemorySessions.values())
    res.json(sessions)
  }
})

// Get a single session by ID
app.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (dbAvailable && pool) {
      const result = await pool.query('SELECT * FROM sessions WHERE id = $1', [id])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' })
      }

      res.json(result.rows[0])
    } else {
      // Use in-memory storage as fallback
      const session = inMemorySessions.get(id)
      if (!session) {
        return res.status(404).json({ error: 'Session not found' })
      }
      res.json(session)
    }
  } catch (error) {
    console.error('Error fetching session:', error)
    // Fallback to in-memory on database error
    const session = inMemorySessions.get(req.params.id)
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }
    res.json(session)
  }
})

// Create a new session
app.post('/sessions', async (req: Request, res: Response) => {
  try {
    const { id, name, request, repo, environment, output } = req.body as Session

    if (!id || !name || !request || !repo || !environment) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const now = new Date().toISOString()
    const session: Session = {
      id,
      name,
      request,
      repo,
      environment,
      output: output || '',
      created_at: now,
      updated_at: now
    }

    if (dbAvailable && pool) {
      const result = await pool.query(
        `INSERT INTO sessions (id, name, request, repo, environment, output, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        [id, name, request, repo, environment, output || '']
      )
      res.status(201).json(result.rows[0])
    } else {
      // Use in-memory storage as fallback
      inMemorySessions.set(id, session)
      res.status(201).json(session)
    }
  } catch (error) {
    console.error('Error creating session:', error)
    // Fallback to in-memory on database error
    const { id, name, request, repo, environment, output } = req.body as Session
    const now = new Date().toISOString()
    const session: Session = {
      id,
      name,
      request,
      repo,
      environment,
      output: output || '',
      created_at: now,
      updated_at: now
    }
    inMemorySessions.set(id, session)
    res.status(201).json(session)
  }
})

// Update a session
app.put('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, request, repo, environment, output } = req.body

    if (dbAvailable && pool) {
      const updates: string[] = []
      const values: any[] = []
      let paramCount = 1

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`)
        values.push(name)
      }
      if (request !== undefined) {
        updates.push(`request = $${paramCount++}`)
        values.push(request)
      }
      if (repo !== undefined) {
        updates.push(`repo = $${paramCount++}`)
        values.push(repo)
      }
      if (environment !== undefined) {
        updates.push(`environment = $${paramCount++}`)
        values.push(environment)
      }
      if (output !== undefined) {
        updates.push(`output = $${paramCount++}`)
        values.push(output)
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' })
      }

      updates.push(`updated_at = NOW()`)
      values.push(id)

      const result = await pool.query(
        `UPDATE sessions SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' })
      }

      res.json(result.rows[0])
    } else {
      // Use in-memory storage as fallback
      const session = inMemorySessions.get(id)
      if (!session) {
        return res.status(404).json({ error: 'Session not found' })
      }

      if (name !== undefined) session.name = name
      if (request !== undefined) session.request = request
      if (repo !== undefined) session.repo = repo
      if (environment !== undefined) session.environment = environment
      if (output !== undefined) session.output = output
      session.updated_at = new Date().toISOString()

      inMemorySessions.set(id, session)
      res.json(session)
    }
  } catch (error) {
    console.error('Error updating session:', error)
    // Fallback to in-memory on database error
    const session = inMemorySessions.get(req.params.id)
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }
    const { name, request, repo, environment, output } = req.body
    if (name !== undefined) session.name = name
    if (request !== undefined) session.request = request
    if (repo !== undefined) session.repo = repo
    if (environment !== undefined) session.environment = environment
    if (output !== undefined) session.output = output
    session.updated_at = new Date().toISOString()
    inMemorySessions.set(req.params.id, session)
    res.json(session)
  }
})

// Delete a session
app.delete('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (dbAvailable && pool) {
      const result = await pool.query('DELETE FROM sessions WHERE id = $1 RETURNING *', [id])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' })
      }

      res.json({ message: 'Session deleted successfully', session: result.rows[0] })
    } else {
      // Use in-memory storage as fallback
      const session = inMemorySessions.get(id)
      if (!session) {
        return res.status(404).json({ error: 'Session not found' })
      }
      inMemorySessions.delete(id)
      res.json({ message: 'Session deleted successfully', session })
    }
  } catch (error) {
    console.error('Error deleting session:', error)
    // Fallback to in-memory on database error
    const session = inMemorySessions.get(req.params.id)
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }
    inMemorySessions.delete(req.params.id)
    res.json({ message: 'Session deleted successfully', session })
  }
})

// Helper function to parse .gitignore patterns
function parseGitignore(gitignorePath: string): Set<string> {
  const patterns = new Set<string>()

  try {
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8')
      const lines = content.split('\n')

      for (const line of lines) {
        const trimmed = line.trim()
        // Skip empty lines and comments
        if (trimmed && !trimmed.startsWith('#')) {
          patterns.add(trimmed)
        }
      }
    }
  } catch (error) {
    console.error('Error reading .gitignore:', error)
  }

  // Add common patterns that should always be ignored
  patterns.add('node_modules')
  patterns.add('.git')
  patterns.add('dist')
  patterns.add('.env')
  patterns.add('.env.local')

  return patterns
}

// Helper function to check if a path matches gitignore patterns
function shouldIgnore(filePath: string, patterns: Set<string>): boolean {
  const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath
  const parts = relativePath.split(path.sep)

  for (const pattern of patterns) {
    // Handle directory patterns
    if (pattern.endsWith('/')) {
      const dirPattern = pattern.slice(0, -1)
      if (parts.includes(dirPattern)) {
        return true
      }
    }

    // Handle wildcard patterns
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
      if (parts.some(part => regex.test(part)) || regex.test(relativePath)) {
        return true
      }
    }

    // Handle exact matches
    if (parts.includes(pattern) || relativePath === pattern || relativePath.endsWith('/' + pattern)) {
      return true
    }
  }

  return false
}

// Helper function to recursively read directory
function readDirectoryRecursive(
  dir: string,
  baseDir: string,
  patterns: Set<string>,
  files: Array<{ path: string; content: string }> = []
): Array<{ path: string; content: string }> {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = path.relative(baseDir, fullPath)

      // Skip if matches gitignore patterns
      if (shouldIgnore(relativePath, patterns)) {
        continue
      }

      if (entry.isDirectory()) {
        readDirectoryRecursive(fullPath, baseDir, patterns, files)
      } else if (entry.isFile()) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8')
          files.push({ path: relativePath, content })
        } catch (error) {
          // Skip binary files or files that can't be read as text
          console.log(`Skipping file (possibly binary): ${relativePath}`)
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
  }

  return files
}

// Get llm.txt content (repo source as text)
app.get('/llm-txt', (req: Request, res: Response) => {
  try {
    // Get the repo root (current working directory)
    const repoRoot = process.cwd()
    const gitignorePath = path.join(repoRoot, '.gitignore')

    // Parse .gitignore patterns
    const patterns = parseGitignore(gitignorePath)

    // Read all files
    const files = readDirectoryRecursive(repoRoot, repoRoot, patterns)

    // Sort files by path for consistent output
    files.sort((a, b) => a.path.localeCompare(b.path))

    // Format as a single text file
    let output = '# Repository Source Code\n\n'
    output += `Generated: ${new Date().toISOString()}\n`
    output += `Total files: ${files.length}\n\n`
    output += '=' .repeat(80) + '\n\n'

    for (const file of files) {
      output += `File: ${file.path}\n`
      output += '-'.repeat(80) + '\n'
      output += file.content
      output += '\n\n' + '='.repeat(80) + '\n\n'
    }

    // Return as plain text
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.send(output)
  } catch (error) {
    console.error('Error generating llm.txt:', error)
    res.status(500).json({ error: 'Failed to generate repo source' })
  }
})

// Admin password reset endpoint (protected by environment variable)
app.post('/reset-admin', async (req: Request, res: Response) => {
  try {
    // Check if reset token matches environment variable
    const resetToken = req.headers['x-reset-token']
    const expectedToken = process.env.ADMIN_RESET_TOKEN

    if (!expectedToken) {
      return res.status(404).json({ error: 'Endpoint not available' })
    }

    if (resetToken !== expectedToken) {
      return res.status(401).json({ error: 'Invalid reset token' })
    }

    if (!pool || !dbAvailable) {
      return res.status(503).json({ error: 'Database not available' })
    }

    // Delete existing admin users
    await pool.query(`DELETE FROM users WHERE role = 'admin'`)

    // Create new admin user
    const defaultPassword = generateRandomPassword()
    const passwordHash = await hashPassword(defaultPassword)
    const adminId = uuidv4()

    await pool.query(`
      INSERT INTO users (id, email, password_hash, role, name)
      VALUES ($1, $2, $3, $4, $5)
    `, [adminId, 'admin@example.com', passwordHash, 'admin', 'Admin User'])

    console.log('')
    console.log('🔐 ═══════════════════════════════════════════════════════')
    console.log('🔐 ADMIN PASSWORD RESET')
    console.log('🔐 ═══════════════════════════════════════════════════════')
    console.log('🔐 Email:    admin@example.com')
    console.log(`🔐 Password: ${defaultPassword}`)
    console.log('🔐 ═══════════════════════════════════════════════════════')
    console.log('')

    res.json({
      message: 'Admin password reset successfully',
      email: 'admin@example.com',
      password: defaultPassword
    })
  } catch (error) {
    console.error('Reset admin error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'backend',
    database: dbAvailable ? 'connected' : 'unavailable (using in-memory storage)',
    storageMode: dbAvailable ? 'postgresql' : 'in-memory',
    timestamp: new Date().toISOString()
  })
})

// Start server
async function start() {
  console.log('🚀 Starting backend server...')
  console.log(`📡 Port: ${PORT}`)

  // Initialize database pool
  initPool()

  // Try to initialize database schema (wait for it to complete)
  if (pool) {
    try {
      await initDatabase()
    } catch (err) {
      console.error('❌ Failed to initialize database:', err)
      console.log('⚠️  Continuing with in-memory storage')
    }
  }

  // Create in-memory admin user if database is not available
  if (!dbAvailable) {
    await createInMemoryAdmin()
  }

  // Mount auth routes (after pool initialization)
  const authRoutes = createAuthRoutes(pool, dbAvailable, inMemoryUsers)
  app.use('/auth', authRoutes)

  // Mount user management routes (admin only)
  const userRoutes = createUserRoutes(pool, dbAvailable, inMemoryUsers)
  app.use('/users', userRoutes)

  // Start listening
  app.listen(PORT, () => {
    console.log(`✅ Backend API server running on port ${PORT}`)
    console.log(`📡 Routes: /sessions, /auth, /users, /llm-txt, /health`)
    console.log(`📡 (accessed via reverse proxy at /api/...)`)
    console.log(`💾 Storage mode: ${dbAvailable ? 'PostgreSQL' : 'In-Memory (temporary)'}`)

    if (!dbAvailable) {
      console.log('')
      console.log('⚠️  WARNING: No database connection!')
      console.log('⚠️  Sessions will be stored in memory and lost on restart')
      console.log('⚠️  Set DATABASE_URL environment variable to enable persistence')
    }
  })
}

start().catch(console.error)
