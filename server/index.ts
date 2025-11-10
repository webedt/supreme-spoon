import express, { Request, Response } from 'express'
import cors from 'cors'
import { Pool } from 'pg'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1j5scrtsy1mgpr0a@webedt-app-webedt-mejega:5432/webedt',
})

// Initialize database schema
async function initDatabase() {
  try {
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
    console.log('✅ Database schema initialized')
  } catch (error) {
    console.error('❌ Error initializing database:', error)
  }
}

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

// API Routes

// Get all sessions
app.get('/api/sessions', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sessions ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
})

// Get a single session by ID
app.get('/api/sessions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM sessions WHERE id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching session:', error)
    res.status(500).json({ error: 'Failed to fetch session' })
  }
})

// Create a new session
app.post('/api/sessions', async (req: Request, res: Response) => {
  try {
    const { id, name, request, repo, environment, output } = req.body as Session

    if (!id || !name || !request || !repo || !environment) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const result = await pool.query(
      `INSERT INTO sessions (id, name, request, repo, environment, output, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [id, name, request, repo, environment, output || '']
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating session:', error)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

// Update a session
app.put('/api/sessions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, request, repo, environment, output } = req.body

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
  } catch (error) {
    console.error('Error updating session:', error)
    res.status(500).json({ error: 'Failed to update session' })
  }
})

// Delete a session
app.delete('/api/sessions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM sessions WHERE id = $1 RETURNING *', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' })
    }

    res.json({ message: 'Session deleted successfully', session: result.rows[0] })
  } catch (error) {
    console.error('Error deleting session:', error)
    res.status(500).json({ error: 'Failed to delete session' })
  }
})

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'))

  // Catch-all route for SPA - must be last
  app.use((req: Request, res: Response, next) => {
    if (!req.path.startsWith('/api') && !req.path.includes('.')) {
      res.sendFile('index.html', { root: 'dist' })
    } else {
      next()
    }
  })
}

// Start server
async function start() {
  await initDatabase()

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📡 API available at http://localhost:${PORT}/api/sessions`)
  })
}

start().catch(console.error)
