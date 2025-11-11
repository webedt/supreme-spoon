import { Router, Request, Response } from 'express'
import { Pool } from 'pg'
import {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken,
  isValidEmail,
  isValidPassword,
  type JWTPayload,
  type UserRole
} from './auth.js'

export function createAuthRoutes(pool: Pool | null, dbAvailable: boolean) {
  const router = Router()

  // Login endpoint
  router.post('/login', async (req: Request, res: Response) => {
    try {
      if (!pool || !dbAvailable) {
        return res.status(503).json({ error: 'Database not available' })
      }

      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }

      // Find user by email
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }

      const user = result.rows[0]

      // Check password
      const isValidPassword = await comparePassword(password, user.password_hash)
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }

      // Generate JWT token
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role as UserRole
      }
      const token = generateToken(payload)

      // Return user data (without password hash) and token
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          created_at: user.created_at
        }
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  // Get current user info (requires authentication)
  router.get('/me', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!pool || !dbAvailable) {
        return res.status(503).json({ error: 'Database not available' })
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      // Get full user data from database
      const result = await pool.query('SELECT id, email, role, name, created_at, updated_at FROM users WHERE id = $1', [req.user.userId])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.json(result.rows[0])
    } catch (error) {
      console.error('Get user error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  // Change password (requires authentication)
  router.post('/change-password', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!pool || !dbAvailable) {
        return res.status(503).json({ error: 'Database not available' })
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' })
      }

      // Validate new password
      const validation = isValidPassword(newPassword)
      if (!validation.valid) {
        return res.status(400).json({ error: validation.message })
      }

      // Get current user
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId])
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' })
      }

      const user = userResult.rows[0]

      // Verify current password
      const isValid = await comparePassword(currentPassword, user.password_hash)
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' })
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword)

      // Update password
      await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newPasswordHash, req.user.userId]
      )

      res.json({ message: 'Password changed successfully' })
    } catch (error) {
      console.error('Change password error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  // Update user profile (requires authentication)
  router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!pool || !dbAvailable) {
        return res.status(503).json({ error: 'Database not available' })
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      const { name, email } = req.body

      if (!name && !email) {
        return res.status(400).json({ error: 'No fields to update' })
      }

      const updates: string[] = []
      const values: any[] = []
      let paramCount = 1

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`)
        values.push(name)
      }

      if (email !== undefined) {
        // Validate email
        if (!isValidEmail(email)) {
          return res.status(400).json({ error: 'Invalid email format' })
        }

        // Check if email is already taken by another user
        const emailCheck = await pool.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [email.toLowerCase(), req.user.userId]
        )
        if (emailCheck.rows.length > 0) {
          return res.status(400).json({ error: 'Email already in use' })
        }

        updates.push(`email = $${paramCount++}`)
        values.push(email.toLowerCase())
      }

      updates.push('updated_at = NOW()')
      values.push(req.user.userId)

      const result = await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, role, name, created_at, updated_at`,
        values
      )

      res.json(result.rows[0])
    } catch (error) {
      console.error('Update profile error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  // Logout (client-side only, just for consistency)
  router.post('/logout', (req: Request, res: Response) => {
    // JWT is stateless, so logout is handled client-side by removing the token
    res.json({ message: 'Logged out successfully' })
  })

  return router
}
