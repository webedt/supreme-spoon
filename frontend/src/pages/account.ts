// User Account Page Module

import type { Page } from '../utils/types'
import { getCurrentUser, updateProfile, changePassword, logout, isAuthenticated } from '../utils/auth'
import { navigateToPage } from '../utils/router'

export const accountPage: Page = {
  id: 'account',
  title: 'My Account',
  icon: '👤',
  render: () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      setTimeout(() => navigateToPage('login'), 0)
      return '<div class="page-content"><p>Redirecting to login...</p></div>'
    }

    const user = getCurrentUser()
    if (!user) {
      return '<div class="page-content"><p>User not found</p></div>'
    }

    return `
    <div class="page-content" style="max-width: 800px; margin: 0 auto;">
      <h1>👤 My Account</h1>
      <p class="message">Manage your profile and security settings</p>

      <!-- Profile Information -->
      <div class="card" style="margin-bottom: 2rem;">
        <h2 style="margin-top: 0;">Profile Information</h2>

        <form id="profile-form">
          <div style="margin-bottom: 1.5rem;">
            <label for="name" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value="${user.name || ''}"
              style="width: 100%; padding: 0.75rem; border: 1px solid #444; border-radius: 6px; background: #2a2a2a; color: #e0e0e0; font-size: 1rem;"
              placeholder="Your name"
            />
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label for="email" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value="${user.email}"
              style="width: 100%; padding: 0.75rem; border: 1px solid #444; border-radius: 6px; background: #2a2a2a; color: #e0e0e0; font-size: 1rem;"
              placeholder="your@email.com"
            />
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
              Role
            </label>
            <div style="padding: 0.75rem; border: 1px solid #444; border-radius: 6px; background: #1a1a1a; color: #888;">
              ${getRoleBadge(user.role)}
            </div>
          </div>

          <div id="profile-message" style="display: none; margin-bottom: 1rem; padding: 1rem; border-radius: 6px;">
          </div>

          <button
            type="submit"
            class="btn-primary"
          >
            Update Profile
          </button>
        </form>
      </div>

      <!-- Change Password -->
      <div class="card" style="margin-bottom: 2rem;">
        <h2 style="margin-top: 0;">Change Password</h2>

        <form id="password-form">
          <div style="margin-bottom: 1.5rem;">
            <label for="current-password" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
              Current Password
            </label>
            <input
              type="password"
              id="current-password"
              name="current-password"
              required
              style="width: 100%; padding: 0.75rem; border: 1px solid #444; border-radius: 6px; background: #2a2a2a; color: #e0e0e0; font-size: 1rem;"
              placeholder="Enter current password"
            />
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label for="new-password" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
              New Password
            </label>
            <input
              type="password"
              id="new-password"
              name="new-password"
              required
              style="width: 100%; padding: 0.75rem; border: 1px solid #444; border-radius: 6px; background: #2a2a2a; color: #e0e0e0; font-size: 1rem;"
              placeholder="Enter new password"
            />
            <small style="color: #888; display: block; margin-top: 0.5rem;">
              Must be at least 8 characters with uppercase, lowercase, and numbers
            </small>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label for="confirm-password" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              required
              style="width: 100%; padding: 0.75rem; border: 1px solid #444; border-radius: 6px; background: #2a2a2a; color: #e0e0e0; font-size: 1rem;"
              placeholder="Confirm new password"
            />
          </div>

          <div id="password-message" style="display: none; margin-bottom: 1rem; padding: 1rem; border-radius: 6px;">
          </div>

          <button
            type="submit"
            class="btn-primary"
          >
            Change Password
          </button>
        </form>
      </div>

      <!-- Logout -->
      <div class="card">
        <h2 style="margin-top: 0;">Session</h2>
        <p style="color: #888; margin-bottom: 1rem;">
          Log out of your account
        </p>
        <button
          id="logout-button"
          style="padding: 0.75rem 1.5rem; background: #ff4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;"
        >
          Logout
        </button>
      </div>
    </div>
  `
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

function showMessage(elementId: string, message: string, isError: boolean): void {
  const element = document.getElementById(elementId)
  if (element) {
    element.textContent = message
    element.style.display = 'block'
    element.style.background = isError ? '#ff000020' : '#00ff0020'
    element.style.border = isError ? '1px solid #ff000040' : '1px solid #00ff0040'
    element.style.color = isError ? '#ff6b6b' : '#6bff6b'
  }
}

function hideMessage(elementId: string): void {
  const element = document.getElementById(elementId)
  if (element) {
    element.style.display = 'none'
  }
}

/**
 * Attach event listeners for the account page
 */
export function attachAccountListeners(): void {
  // Profile form
  const profileForm = document.querySelector<HTMLFormElement>('#profile-form')
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      hideMessage('profile-message')

      const name = (profileForm.elements.namedItem('name') as HTMLInputElement).value
      const email = (profileForm.elements.namedItem('email') as HTMLInputElement).value

      const submitButton = profileForm.querySelector<HTMLButtonElement>('button[type="submit"]')
      if (submitButton) {
        submitButton.disabled = true
        submitButton.textContent = 'Updating...'
      }

      const result = await updateProfile({ name, email })

      if (result.success) {
        showMessage('profile-message', 'Profile updated successfully!', false)
      } else {
        showMessage('profile-message', result.error || 'Failed to update profile', true)
      }

      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = 'Update Profile'
      }
    })
  }

  // Password form
  const passwordForm = document.querySelector<HTMLFormElement>('#password-form')
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      hideMessage('password-message')

      const currentPassword = (passwordForm.elements.namedItem('current-password') as HTMLInputElement).value
      const newPassword = (passwordForm.elements.namedItem('new-password') as HTMLInputElement).value
      const confirmPassword = (passwordForm.elements.namedItem('confirm-password') as HTMLInputElement).value

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        showMessage('password-message', 'New passwords do not match', true)
        return
      }

      const submitButton = passwordForm.querySelector<HTMLButtonElement>('button[type="submit"]')
      if (submitButton) {
        submitButton.disabled = true
        submitButton.textContent = 'Changing...'
      }

      const result = await changePassword(currentPassword, newPassword)

      if (result.success) {
        showMessage('password-message', 'Password changed successfully!', false)
        passwordForm.reset()
      } else {
        showMessage('password-message', result.error || 'Failed to change password', true)
      }

      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = 'Change Password'
      }
    })
  }

  // Logout button
  const logoutButton = document.querySelector<HTMLButtonElement>('#logout-button')
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      if (confirm('Are you sure you want to log out?')) {
        await logout()
        navigateToPage('login')
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
    })
  }
}
