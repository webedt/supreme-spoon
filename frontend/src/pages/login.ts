// Login Page Module

import type { Page } from '../utils/types'
import { login, isAuthenticated } from '../utils/auth'
import { navigateToPage } from '../utils/router'

export const loginPage: Page = {
  id: 'login',
  title: 'Login',
  icon: '🔐',
  render: () => {
    // Redirect to home if already authenticated
    if (isAuthenticated()) {
      setTimeout(() => navigateToPage('home'), 0)
      return '<div class="page-content"><p>Redirecting...</p></div>'
    }

    return `
    <div class="page-content" style="max-width: 500px; margin: 0 auto;">
      <h1>🔐 Login</h1>
      <p class="message">Please log in to continue</p>

      <div class="card">
        <form id="login-form">
          <div style="margin-bottom: 1.5rem;">
            <label for="email" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autocomplete="email"
              style="width: 100%; padding: 0.75rem; border: 1px solid #444; border-radius: 6px; background: #2a2a2a; color: #e0e0e0; font-size: 1rem;"
              placeholder="admin@webedt.com"
            />
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label for="password" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autocomplete="current-password"
              style="width: 100%; padding: 0.75rem; border: 1px solid #444; border-radius: 6px; background: #2a2a2a; color: #e0e0e0; font-size: 1rem;"
              placeholder="Enter your password"
            />
          </div>

          <div id="login-error" style="display: none; margin-bottom: 1rem; padding: 1rem; background: #ff000020; border: 1px solid #ff000040; border-radius: 6px; color: #ff6b6b;">
          </div>

          <button
            type="submit"
            class="btn-primary"
            style="width: 100%; padding: 0.875rem; font-size: 1rem;"
          >
            Login
          </button>
        </form>

        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #444; text-align: center; color: #888;">
          <p style="margin: 0;">
            <strong>Default Admin:</strong> admin@webedt.com<br/>
            <small>Check server logs for the password</small>
          </p>
        </div>
      </div>
    </div>
  `
  }
}

/**
 * Attach event listeners for the login page
 */
export function attachLoginListeners(): void {
  const form = document.querySelector<HTMLFormElement>('#login-form')
  const errorDiv = document.querySelector<HTMLDivElement>('#login-error')

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()

      const email = (form.elements.namedItem('email') as HTMLInputElement).value
      const password = (form.elements.namedItem('password') as HTMLInputElement).value

      // Disable form during submission
      const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]')
      if (submitButton) {
        submitButton.disabled = true
        submitButton.textContent = 'Logging in...'
      }

      // Hide previous errors
      if (errorDiv) {
        errorDiv.style.display = 'none'
      }

      // Attempt login
      const result = await login(email, password)

      if (result.success) {
        // Redirect to home page
        navigateToPage('home')

        // Reload to update sidebar and other components
        setTimeout(() => {
          window.location.reload()
        }, 100)
      } else {
        // Show error
        if (errorDiv) {
          errorDiv.textContent = result.error || 'Login failed'
          errorDiv.style.display = 'block'
        }

        // Re-enable form
        if (submitButton) {
          submitButton.disabled = false
          submitButton.textContent = 'Login'
        }
      }
    })
  }
}
