// Sessions Page Module

import type { Page } from '../utils/types'
import {
  getSessions,
  getCurrentSession,
  setCurrentSession,
  createSession,
  updateSession,
  deleteSession
} from '../utils/api'
import { formatDate, generateMockOutput } from '../utils/helpers'

export const sessionsPage: Page = {
  id: 'sessions',
  title: 'Sessions',
  icon: '🚀',
  render: () => {
    const currentSession = getCurrentSession()

    return `
      <div class="page-content">
        <h1>Sessions</h1>
        <p class="message">
          Create and manage your development sessions with different repositories and environments.
        </p>

        <div class="sessions-container">
          <!-- Sessions Sidebar -->
          <div class="sessions-sidebar">
            <button id="new-session-btn" class="new-session-btn">+ New Session</button>
            <div class="sessions-sidebar-header">Recent Sessions</div>
            <div class="sessions-list" id="sessions-list">
              <div class="empty-state">Loading sessions...</div>
            </div>
          </div>

          <!-- Main Content Area -->
          <div class="sessions-main">
            <div class="card">
              <form id="session-form">
                <div class="form-group">
                  <label class="form-label required" for="request">Your Request</label>
                  <textarea
                    id="request"
                    class="form-textarea"
                    placeholder="Describe what you want to build or accomplish..."
                    required
                  >${currentSession?.request || ''}</textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label required" for="github-repo">GitHub Repository</label>
                    <select id="github-repo" class="form-select" required>
                      <option value="">Select a repository...</option>
                      <option value="webedt/supreme-spoon" ${currentSession?.repo === 'webedt/supreme-spoon' ? 'selected' : ''}>webedt/supreme-spoon</option>
                      <option value="webedt/example-app" ${currentSession?.repo === 'webedt/example-app' ? 'selected' : ''}>webedt/example-app</option>
                      <option value="webedt/demo-project" ${currentSession?.repo === 'webedt/demo-project' ? 'selected' : ''}>webedt/demo-project</option>
                      <option value="webedt/starter-template" ${currentSession?.repo === 'webedt/starter-template' ? 'selected' : ''}>webedt/starter-template</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label required" for="environment">Environment</label>
                    <select id="environment" class="form-select" required>
                      <option value="">Select an environment...</option>
                      <option value="production" ${currentSession?.environment === 'production' ? 'selected' : ''}>Production</option>
                      <option value="staging" ${currentSession?.environment === 'staging' ? 'selected' : ''}>Staging</option>
                      <option value="development" ${currentSession?.environment === 'development' ? 'selected' : ''}>Development</option>
                      <option value="testing" ${currentSession?.environment === 'testing' ? 'selected' : ''}>Testing</option>
                    </select>
                  </div>
                </div>

                <button type="submit" class="submit-button">${currentSession ? 'Update Session' : 'Create Session'}</button>
              </form>

              <div id="session-output" class="output-container ${currentSession?.output ? '' : 'hidden'}">
                <div class="output-header">Session Output</div>
                <div id="output-content" class="output-content">${currentSession?.output || ''}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

/**
 * Render the sessions list in the sidebar
 */
async function renderSessionsList(): Promise<void> {
  const listContainer = document.querySelector('#sessions-list')
  if (!listContainer) return

  const sessions = await getSessions()
  const currentSession = getCurrentSession()

  if (sessions.length === 0) {
    listContainer.innerHTML = '<div class="empty-state">No sessions yet. Create one to get started!</div>'
    return
  }

  listContainer.innerHTML = sessions.map(session => {
    const dateStr = session.created_at || session.createdAt || new Date().toISOString()
    const formattedDate = formatDate(dateStr)
    const isActive = currentSession?.id === session.id

    return `
      <div class="session-item ${isActive ? 'active' : ''}" data-session-id="${session.id}">
        <div class="session-item-header">
          <div class="session-item-name" data-editable="false">${session.name}</div>
          <div class="session-item-actions">
            <button class="session-action-btn edit-session" data-session-id="${session.id}" title="Rename">✏️</button>
            <button class="session-action-btn delete-session" data-session-id="${session.id}" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="session-item-meta">
          <span class="session-item-date">${formattedDate}</span>
          <span class="session-item-env">${session.environment}</span>
        </div>
      </div>
    `
  }).join('')

  // Attach click listeners to session items
  attachSessionItemListeners(listContainer)
}

/**
 * Attach listeners to session items in the list
 */
function attachSessionItemListeners(listContainer: Element): void {
  // Click to select session
  listContainer.querySelectorAll('.session-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      // Don't trigger if clicking on action buttons
      if (target.closest('.session-action-btn')) return

      const sessionId = item.getAttribute('data-session-id')
      if (sessionId) {
        setCurrentSession(sessionId)
        // Re-render page to show selected session
        const renderPageEvent = new CustomEvent('renderPage', { detail: { pageId: 'sessions' } })
        window.dispatchEvent(renderPageEvent)
      }
    })
  })

  // Edit session name
  listContainer.querySelectorAll('.edit-session').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const sessionId = btn.getAttribute('data-session-id')
      if (sessionId) {
        const sessionItem = btn.closest('.session-item')
        const nameElement = sessionItem?.querySelector('.session-item-name')
        if (nameElement) {
          const currentName = nameElement.textContent || ''
          nameElement.innerHTML = `<input type="text" class="session-item-name-input" value="${currentName}" />`
          const input = nameElement.querySelector('input')
          if (input) {
            input.focus()
            input.select()

            const saveEdit = async () => {
              const newName = input.value.trim()
              if (newName && newName !== currentName) {
                await updateSession(sessionId, { name: newName })
              }
              await renderSessionsList()
            }

            input.addEventListener('blur', () => saveEdit())
            input.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                saveEdit()
              } else if (e.key === 'Escape') {
                renderSessionsList()
              }
            })
          }
        }
      }
    })
  })

  // Delete session
  listContainer.querySelectorAll('.delete-session').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const sessionId = btn.getAttribute('data-session-id')
      if (sessionId && confirm('Are you sure you want to delete this session?')) {
        await deleteSession(sessionId)
        // Re-render page after deletion
        const renderPageEvent = new CustomEvent('renderPage', { detail: { pageId: 'sessions' } })
        window.dispatchEvent(renderPageEvent)
      }
    })
  })
}

/**
 * Attach event listeners for the sessions page
 */
export function attachSessionsListeners(): void {
  // Render the sessions list
  renderSessionsList()

  // New session button
  const newSessionBtn = document.querySelector<HTMLButtonElement>('#new-session-btn')
  if (newSessionBtn) {
    newSessionBtn.addEventListener('click', () => {
      setCurrentSession(null)
      // Re-render page to clear form
      const renderPageEvent = new CustomEvent('renderPage', { detail: { pageId: 'sessions' } })
      window.dispatchEvent(renderPageEvent)
    })
  }

  // Session form
  const form = document.querySelector<HTMLFormElement>('#session-form')
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()

      // Get form values
      const request = (document.querySelector<HTMLTextAreaElement>('#request'))?.value || ''
      const repo = (document.querySelector<HTMLSelectElement>('#github-repo'))?.value || ''
      const environment = (document.querySelector<HTMLSelectElement>('#environment'))?.value || ''

      // Generate mock output
      const outputText = generateMockOutput(request, repo, environment)

      try {
        // Check if we're updating an existing session or creating a new one
        const currentSession = getCurrentSession()
        if (currentSession) {
          // Update existing session
          await updateSession(currentSession.id, {
            request,
            repo,
            environment,
            output: outputText
          })
        } else {
          // Create new session
          await createSession(request, repo, environment, outputText)
        }

        // Re-render the page to show updated session
        const renderPageEvent = new CustomEvent('renderPage', { detail: { pageId: 'sessions' } })
        window.dispatchEvent(renderPageEvent)

        // Scroll to output
        const outputContainer = document.querySelector<HTMLDivElement>('#session-output')
        if (outputContainer) {
          setTimeout(() => {
            outputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }, 100)
        }
      } catch (error) {
        console.error('Error saving session:', error)
        alert('Failed to save session. Please try again.')
      }
    })
  }
}
