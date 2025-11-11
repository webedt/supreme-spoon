import { Router, Request, Response } from 'express'
import { Pool } from 'pg'
import { v4 as uuidv4 } from 'uuid'
import {
  hashPassword,
  authenticateToken,
  authorizeRole,
  isValidEmail,
  isValidPassword,
  generateRandomPassword,
  type UserRole
} from './auth.js'

export function createUserRoutes(pool: Pool | null, dbAvailable: boolean, inMemoryUsers: Map<string, any>) {
  const router = Router()

  // All user management routes require admin role
  router.use(authenticateToken, authorizeRole('admin'))

  // Get all users (admin only)
  router.get('/', async (req: Request, res: Response) => {
    try {
      let users: any[] = []

      if (dbAvailable && pool) {
        // Get from database
        const result = await pool.query(`
          SELECT id, email, role, name, created_at, updated_at
          FROM users
          ORDER BY created_at DESC
        `)
        users = result.rows
      } else {
        // Get from in-memory storage
        users = Array.from(inMemoryUsers.values())
          .filter(u => !u.id.startsWith('email:')) // Filter out email index entries
          .map(u => ({
            id: u.id,
            email: u.email,
            role: u.role,
            name: u.name,
            created_at: u.created_at,
            updated_at: u.updated_at
          }))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }

      res.json(users)
    } catch (error) {
      console.error('Get users error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  // Get a single user (admin only)
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      if (!pool || !dbAvailable) {
        return res.status(503).json({ error: 'Database not available' })
      }

      const { id } = req.params

      const result = await pool.query(`
        SELECT id, email, role, name, created_at, updated_at
        FROM users
        WHERE id = $1
      `, [id])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.json(result.rows[0])
    } catch (error) {
      console.error('Get user error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  // Create a new user (admin only)
  router.post('/', async (req: Request, res: Response) => {
    try {
      if (!pool || !dbAvailable) {
        return res.status(503).json({ error: 'Database not available' })
      }

      const { email, password, role, name } = req.body

      // Validate required fields
      if (!email || !role) {
        return res.status(400).json({ error: 'Email and role are required' })
      }

      // Validate email
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' })
      }

      // Validate role
      const validRoles: UserRole[] = ['admin', 'free', 'lite', 'plus', 'pro']
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be one of: admin, free, lite, plus, pro' })
      }

      // Check if email already exists
      const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' })
      }

      // Generate or validate password
      let finalPassword = password
      if (!password) {
        finalPassword = generateRandomPassword()
      } else {
        const validation = isValidPassword(password)
        if (!validation.valid) {
          return res.status(400).json({ error: validation.message })
        }
      }

      // Hash password
      const passwordHash = await hashPassword(finalPassword)
      const userId = uuidv4()

      // Create user
      const result = await pool.query(`
        INSERT INTO users (id, email, password_hash, role, name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, role, name, created_at, updated_at
      `, [userId, email.toLowerCase(), passwordHash, role, name || null])

      const newUser = result.rows[0]

      // Include generated password in response if it was auto-generated
      if (!password) {
        res.status(201).json({
          user: newUser,
          generatedPassword: finalPassword,
          message: 'User created successfully. Save the generated password securely.'
        })
      } else {
        res.status(201).json({ user: newUser })
      }
    } catch (error) {
      console.error('Create user error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  // Update a user (admin only)
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      if (!pool || !dbAvailable) {
        return res.status(503).json({ error: 'Database not available' })
      }

      const { id } = req.params
      const { email, role, name, password } = req.body

      // Check if user exists
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id])
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' })
      }

      const updates: string[] = []
      const values: any[] = []
      let paramCount = 1

      if (email !== undefined) {
        if (!isValidEmail(email)) {
          return res.status(400).json({ error: 'Invalid email format' })
        }

        // Check if email is already taken by another user
        const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase(), id])
        if (emailCheck.rows.length > 0) {
          return res.status(400).json({ error: 'Email already in use' })
        }

        updates.push(`email = $${paramCount++}`)
        values.push(email.toLowerCase())
      }

      if (role !== undefined) {
        const validRoles: UserRole[] = ['admin', 'free', 'lite', 'plus', 'pro']
        if (!validRoles.includes(role)) {
          return res.status(400).json({ error: 'Invalid role. Must be one of: admin, free, lite, plus, pro' })
        }

        updates.push(`role = $${paramCount++}`)
        values.push(role)
      }

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`)
        values.push(name)
      }

      if (password !== undefined) {
        const validation = isValidPassword(password)
        if (!validation.valid) {
          return res.status(400).json({ error: validation.message })
        }

        const passwordHash = await hashPassword(password)
        updates.push(`password_hash = $${paramCount++}`)
        values.push(passwordHash)
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' })
      }

      updates.push('updated_at = NOW()')
      values.push(id)

      const result = await pool.query(`
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, email, role, name, created_at, updated_at
      `, values)

      res.json(result.rows[0])
    } catch (error) {
      console.error('Update user error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  // Delete a user (admin only)
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      if (!pool || !dbAvailable) {
        return res.status(503).json({ error: 'Database not available' })
      }

      const { id } = req.params

      // Prevent deleting yourself
      if (req.user?.userId === id) {
        return res.status(400).json({ error: 'Cannot delete your own account' })
      }

      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, email, role', [id])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.json({ message: 'User deleted successfully', user: result.rows[0] })
    } catch (error) {
      console.error('Delete user error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  return router
}
