// User Management Page Module (Admin Only)

import type { Page } from '../utils/types'
import { isAdmin, isAuthenticated, getToken } from '../utils/auth'
import { navigateToPage } from '../utils/router'

interface User {
  id: string
  email: string
  role: string
  name?: string
  created_at: string
  updated_at: string
}

export const usersPage: Page = {
  id: 'users',
  title: 'User Management',
  icon: '👥',
  render: () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      setTimeout(() => navigateToPage('login'), 0)
      return '<div class="page-content"><p>Redirecting to login...</p></div>'
    }

    // Check if user is admin
    if (!isAdmin()) {
      return `
        <div class="page-content">
          <h1>❌ Access Denied</h1>
          <p class="message">You do not have permission to access this page.</p>
          <p>This page is only accessible to administrators.</p>
        </div>
      `
    }

    return `
    <div class="page-content">
      <h1>👥 User Management</h1>
      <p class="message">Manage users and their roles</p>

      <div style="margin-bottom: 2rem;">
        <button id="create-user-button" class="btn-primary">
          ➕ Create New User
        </button>
      </div>

      <div id="users-list" class="card">
        <div style="text-align: center; padding: 2rem; color: #888;">
          Loading users...
        </div>
      </div>

      <!-- Create/Edit User Modal -->
      <div id="user-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 1000; overflow-y: auto;">
        <div style="max-width: 600px; margin: 2rem auto; background: #1a1a1a; border-radius: 12px; padding: 2rem; border: 1px solid #333;">
          <h2 id="modal-title" style="margin-top: 0;">Create User</h2>

          <form id="user-form">
            <input type="hidden" id="user-id" name="user-id" />

            <div style="margin-bottom: 1.5rem;">
              <label for="user-email" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                Email *
              </label>
              <input
                type="email"
                id="user-email"
                name="email"
                required
                style="width: 100%; padding: 0.75rem; border: 1px solid #444; border-radius: 6px; background: #2a2a2a; color: #e0e0e0; font-size: 1rem;"
                placeholder="user@example.com"
              />
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label for="user-name" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                Name
              </label>
              <input
                type="text"
                id="user-name"
                name="name"
                style="width: 100%; padding: 0.75rem; border: 1px solid #444; border-radius: 6px; background: #2a2a2a; color: #e0e0e0; font-size: 1rem;"
                placeholder="User's name"
              />
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label for="user-role" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                Role *
              </label>
              <select
                id="user-role"
                name="role"
                required
                style="width: 100%; padding: 0.75rem; border: 1px solid #444; border-radius: 6px; background: #2a2a2a; color: #e0e0e0; font-size: 1rem;"
              >
                <option value="free">🆓 Free</option>
                <option value="lite">💡 Lite</option>
                <option value="plus">➕ Plus</option>
                <option value="pro">⭐ Pro</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>

            <div id="password-section" style="margin-bottom: 1.5rem;">
              <label for="user-password" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                Password
              </label>
              <input
                type="password"
                id="user-password"
                name="password"
                style="width: 100%; padding: 0.75rem; border: 1px solid #444; border-radius: 6px; background: #2a2a2a; color: #e0e0e0; font-size: 1rem;"
                placeholder="Leave empty to auto-generate"
              />
              <small style="color: #888; display: block; margin-top: 0.5rem;">
                Leave empty to auto-generate a secure password
              </small>
            </div>

            <div id="user-modal-message" style="display: none; margin-bottom: 1rem; padding: 1rem; border-radius: 6px;">
            </div>

            <div style="display: flex; gap: 1rem;">
              <button type="submit" class="btn-primary" style="flex: 1;">
                Save User
              </button>
              <button type="button" id="cancel-modal-button" style="flex: 1; padding: 0.75rem; background: #444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
  }
}

/**
 * Fetch and display users
 */
async function loadUsers(): Promise<void> {
  const listElement = document.getElementById('users-list')
  if (!listElement) return

  try {
    const token = getToken()
    if (!token) {
      listElement.innerHTML = '<p style="text-align: center; color: #ff6b6b;">Not authenticated</p>'
      return
    }

    const response = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }

    const users: User[] = await response.json()

    if (users.length === 0) {
      listElement.innerHTML = '<p style="text-align: center; color: #888;">No users found</p>'
      return
    }

    listElement.innerHTML = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #444;">
            <th style="text-align: left; padding: 1rem;">Email</th>
            <th style="text-align: left; padding: 1rem;">Name</th>
            <th style="text-align: left; padding: 1rem;">Role</th>
            <th style="text-align: left; padding: 1rem;">Created</th>
            <th style="text-align: right; padding: 1rem;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr style="border-bottom: 1px solid #333;">
              <td style="padding: 1rem;">${user.email}</td>
              <td style="padding: 1rem;">${user.name || '-'}</td>
              <td style="padding: 1rem;">${getRoleBadge(user.role)}</td>
              <td style="padding: 1rem;">${new Date(user.created_at).toLocaleDateString()}</td>
              <td style="padding: 1rem; text-align: right;">
                <button class="edit-user-button" data-user-id="${user.id}" style="padding: 0.5rem 1rem; background: #4a90e2; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 0.5rem;">
                  Edit
                </button>
                <button class="delete-user-button" data-user-id="${user.id}" style="padding: 0.5rem 1rem; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  Delete
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `

    // Attach event listeners to edit/delete buttons
    document.querySelectorAll('.edit-user-button').forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.getAttribute('data-user-id')
        if (userId) {
          const user = users.find(u => u.id === userId)
          if (user) openEditModal(user)
        }
      })
    })

    document.querySelectorAll('.delete-user-button').forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.getAttribute('data-user-id')
        if (userId) {
          const user = users.find(u => u.id === userId)
          if (user) deleteUser(user)
        }
      })
    })
  } catch (error) {
    console.error('Error loading users:', error)
    listElement.innerHTML = '<p style="text-align: center; color: #ff6b6b;">Failed to load users</p>'
  }
}

function getRoleBadge(role: string): string {
  const badges: Record<string, string> = {
    admin: '👑 Admin',
    pro: '⭐ Pro',
    plus: '➕ Plus',
    lite: '💡 Lite',
    free: '🆓 Free'
  }
  return badges[role] || role
}

function openCreateModal(): void {
  const modal = document.getElementById('user-modal')
  const modalTitle = document.getElementById('modal-title')
  const form = document.querySelector<HTMLFormElement>('#user-form')
  const passwordSection = document.getElementById('password-section')

  if (modal && modalTitle && form && passwordSection) {
    modalTitle.textContent = 'Create User'
    form.reset()
    ;(document.getElementById('user-id') as HTMLInputElement).value = ''
    passwordSection.style.display = 'block'
    modal.style.display = 'block'
  }
}

function openEditModal(user: User): void {
  const modal = document.getElementById('user-modal')
  const modalTitle = document.getElementById('modal-title')
  const form = document.querySelector<HTMLFormElement>('#user-form')
  const passwordSection = document.getElementById('password-section')

  if (modal && modalTitle && form && passwordSection) {
    modalTitle.textContent = 'Edit User'
    ;(document.getElementById('user-id') as HTMLInputElement).value = user.id
    ;(document.getElementById('user-email') as HTMLInputElement).value = user.email
    ;(document.getElementById('user-name') as HTMLInputElement).value = user.name || ''
    ;(document.getElementById('user-role') as HTMLSelectElement).value = user.role
    passwordSection.style.display = 'none' // Don't show password field for editing
    modal.style.display = 'block'
  }
}

function closeModal(): void {
  const modal = document.getElementById('user-modal')
  if (modal) {
    modal.style.display = 'none'
  }
}

async function saveUser(formData: FormData): Promise<void> {
  const userId = formData.get('user-id') as string
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string
  const password = formData.get('password') as string

  const isEdit = !!userId

  try {
    const token = getToken()
    if (!token) throw new Error('Not authenticated')

    const url = isEdit ? `/api/users/${userId}` : '/api/users'
    const method = isEdit ? 'PUT' : 'POST'

    const body: any = { email, name, role }
    if (password) {
      body.password = password
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save user')
    }

    // Show generated password if applicable
    if (data.generatedPassword) {
      alert(`User created successfully!\n\nGenerated Password: ${data.generatedPassword}\n\nMake sure to save this password - it won't be shown again.`)
    }

    closeModal()
    await loadUsers()
  } catch (error: any) {
    const messageDiv = document.getElementById('user-modal-message')
    if (messageDiv) {
      messageDiv.textContent = error.message || 'Failed to save user'
      messageDiv.style.display = 'block'
      messageDiv.style.background = '#ff000020'
      messageDiv.style.border = '1px solid #ff000040'
      messageDiv.style.color = '#ff6b6b'
    }
  }
}

async function deleteUser(user: User): Promise<void> {
  if (!confirm(`Are you sure you want to delete ${user.email}?`)) {
    return
  }

  try {
    const token = getToken()
    if (!token) throw new Error('Not authenticated')

    const response = await fetch(`/api/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete user')
    }

    await loadUsers()
  } catch (error: any) {
    alert(error.message || 'Failed to delete user')
  }
}

/**
 * Attach event listeners for the users page
 */
export function attachUsersListeners(): void {
  // Load users
  loadUsers()

  // Create user button
  const createButton = document.getElementById('create-user-button')
  if (createButton) {
    createButton.addEventListener('click', openCreateModal)
  }

  // Cancel modal button
  const cancelButton = document.getElementById('cancel-modal-button')
  if (cancelButton) {
    cancelButton.addEventListener('click', closeModal)
  }

  // User form submission
  const form = document.querySelector<HTMLFormElement>('#user-form')
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const formData = new FormData(form)
      await saveUser(formData)
    })
  }

  // Close modal when clicking outside
  const modal = document.getElementById('user-modal')
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal()
      }
    })
  }
}
