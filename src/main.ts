import './style.css'

// Session management types and storage
interface Session {
  id: string
  name: string
  request: string
  repo: string
  environment: string
  output: string
  createdAt: string
  updatedAt: string
}

const SESSIONS_KEY = 'sessions'
const CURRENT_SESSION_KEY = 'currentSession'

function getSessions(): Session[] {
  const stored = localStorage.getItem(SESSIONS_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveSessions(sessions: Session[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

function getCurrentSession(): Session | null {
  const sessionId = localStorage.getItem(CURRENT_SESSION_KEY)
  if (!sessionId) return null
  const sessions = getSessions()
  return sessions.find(s => s.id === sessionId) || null
}

function setCurrentSession(sessionId: string | null): void {
  if (sessionId) {
    localStorage.setItem(CURRENT_SESSION_KEY, sessionId)
  } else {
    localStorage.removeItem(CURRENT_SESSION_KEY)
  }
}

function createSession(request: string, repo: string, environment: string, output: string): Session {
  const session: Session = {
    id: generateSessionId(),
    name: `Session ${new Date().toLocaleString()}`,
    request,
    repo,
    environment,
    output,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const sessions = getSessions()
  sessions.unshift(session) // Add to beginning
  saveSessions(sessions)
  setCurrentSession(session.id)

  return session
}

function updateSession(sessionId: string, updates: Partial<Session>): void {
  const sessions = getSessions()
  const index = sessions.findIndex(s => s.id === sessionId)
  if (index !== -1) {
    sessions[index] = {
      ...sessions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    saveSessions(sessions)
  }
}

function deleteSession(sessionId: string): void {
  const sessions = getSessions()
  const filtered = sessions.filter(s => s.id !== sessionId)
  saveSessions(filtered)

  // If we deleted the current session, clear it
  if (getCurrentSession()?.id === sessionId) {
    setCurrentSession(null)
  }
}

// Theme management
const THEME_KEY = 'theme'
const THEME_LIGHT = 'light'
const THEME_DARK = 'dark'

function getStoredTheme(): string | null {
  return localStorage.getItem(THEME_KEY)
}

function setStoredTheme(theme: string): void {
  localStorage.setItem(THEME_KEY, theme)
}

function getSystemTheme(): string {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? THEME_LIGHT : THEME_DARK
}

function getCurrentTheme(): string {
  return getStoredTheme() ?? getSystemTheme()
}

function applyTheme(theme: string): void {
  const root = document.documentElement
  if (theme === THEME_LIGHT) {
    root.classList.add('light')
    root.classList.remove('dark')
  } else {
    root.classList.add('dark')
    root.classList.remove('light')
  }
}

function toggleTheme(): void {
  const currentTheme = getCurrentTheme()
  const newTheme = currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT
  setStoredTheme(newTheme)
  applyTheme(newTheme)
  updateThemeButton()
}

function updateThemeButton(): void {
  const button = document.querySelector<HTMLButtonElement>('#theme-toggle')
  if (button) {
    const currentTheme = getCurrentTheme()
    const icon = currentTheme === THEME_LIGHT ? '🌙' : '☀️'
    const label = currentTheme === THEME_LIGHT ? 'Dark' : 'Light'
    button.innerHTML = `${icon} ${label}`
  }
}

// Page definitions
interface Page {
  id: string
  title: string
  icon: string
  render: () => string
}

const pages: Page[] = [
  {
    id: 'home',
    title: 'Home',
    icon: '🏠',
    render: () => `
      <div class="page-content">
        <h1>Welcome Home!</h1>
        <p class="message">
          This is your home page. Use the sidebar to navigate between different pages.
        </p>
        <div class="card">
          <h2>Getting Started</h2>
          <p>You can add more pages by updating the pages array in main.ts</p>
          <button id="counter" type="button">Count is 0</button>
        </div>
      </div>
    `
  },
  {
    id: 'sessions',
    title: 'Sessions',
    icon: '🚀',
    render: () => {
      const sessions = getSessions()
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
                ${sessions.length === 0 ? '<div class="empty-state">No sessions yet. Create one to get started!</div>' : ''}
              </div>
            </div>

            <!-- Main Content Area -->
            <div class="sessions-main">
              <div class="card">
                <form id="session-form">
                  <div class="form-group">
                    <label class="form-label" for="request">Your Request</label>
                    <textarea
                      id="request"
                      class="form-textarea"
                      placeholder="Describe what you want to build or accomplish..."
                      required
                    >${currentSession?.request || ''}</textarea>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label" for="github-repo">GitHub Repository</label>
                      <select id="github-repo" class="form-select" required>
                        <option value="">Select a repository...</option>
                        <option value="webedt/supreme-spoon" ${currentSession?.repo === 'webedt/supreme-spoon' ? 'selected' : ''}>webedt/supreme-spoon</option>
                        <option value="webedt/example-app" ${currentSession?.repo === 'webedt/example-app' ? 'selected' : ''}>webedt/example-app</option>
                        <option value="webedt/demo-project" ${currentSession?.repo === 'webedt/demo-project' ? 'selected' : ''}>webedt/demo-project</option>
                        <option value="webedt/starter-template" ${currentSession?.repo === 'webedt/starter-template' ? 'selected' : ''}>webedt/starter-template</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label class="form-label" for="environment">Environment</label>
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
  },
  {
    id: 'about',
    title: 'About',
    icon: 'ℹ️',
    render: () => `
      <div class="page-content">
        <h1>About</h1>
        <p class="message">
          This is a multi-page application built with vanilla TypeScript and Vite.
        </p>
        <div class="card">
          <h2>Features</h2>
          <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
            <li>Sidebar navigation</li>
            <li>Multiple pages</li>
            <li>Dark/Light theme toggle</li>
            <li>Hash-based routing</li>
            <li>TypeScript support</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: '⚙️',
    render: () => `
      <div class="page-content">
        <h1>Settings</h1>
        <p class="message">
          Configure your application preferences here.
        </p>
        <div class="card">
          <h2>Theme Settings</h2>
          <p>Use the theme toggle in the header to switch between light and dark modes.</p>
        </div>
      </div>
    `
  }
]

// Routing system
function getCurrentPage(): string {
  const hash = window.location.hash.slice(1) // Remove the '#'
  return hash || 'home' // Default to home
}

function navigateToPage(pageId: string): void {
  window.location.hash = pageId
}

function renderPage(pageId: string): void {
  const page = pages.find(p => p.id === pageId) || pages[0]
  const contentArea = document.querySelector<HTMLDivElement>('#page-content')

  if (contentArea) {
    contentArea.innerHTML = page.render()

    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-page') === pageId) {
        item.classList.add('active')
      } else {
        item.classList.remove('active')
      }
    })

    // Re-attach event listeners for dynamic content
    attachPageEventListeners(pageId)
  }
}

function attachPageEventListeners(pageId: string): void {
  // Attach counter button listener for home page
  if (pageId === 'home') {
    let counter = 0
    const counterButton = document.querySelector<HTMLButtonElement>('#counter')
    if (counterButton) {
      counterButton.addEventListener('click', () => {
        counter++
        counterButton.textContent = `Count is ${counter}`
      })
    }
  }

  // Attach form listener for sessions page
  if (pageId === 'sessions') {
    // Render the sessions list
    renderSessionsList()

    // New session button
    const newSessionBtn = document.querySelector<HTMLButtonElement>('#new-session-btn')
    if (newSessionBtn) {
      newSessionBtn.addEventListener('click', () => {
        setCurrentSession(null)
        renderPage('sessions')
      })
    }

    // Session form
    const form = document.querySelector<HTMLFormElement>('#session-form')
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault()

        // Get form values
        const request = (document.querySelector<HTMLTextAreaElement>('#request'))?.value || ''
        const repo = (document.querySelector<HTMLSelectElement>('#github-repo'))?.value || ''
        const environment = (document.querySelector<HTMLSelectElement>('#environment'))?.value || ''

        // Generate mock output with random phrases
        const mockPhrases = [
          'Initializing session workspace...',
          'Connecting to GitHub repository...',
          'Setting up environment configuration...',
          'Installing dependencies...',
          'Running build scripts...',
          'Configuring deployment settings...',
          'Starting development server...',
          'Generating session credentials...',
          'Allocating compute resources...',
          'Establishing secure connection...',
          'Session created successfully!',
          'Your workspace is ready to use.',
          'Navigate to the dashboard to view details.',
        ]

        // Randomly select 5-8 phrases
        const numPhrases = Math.floor(Math.random() * 4) + 5
        const selectedPhrases: string[] = []
        const usedIndices = new Set<number>()

        while (selectedPhrases.length < numPhrases) {
          const index = Math.floor(Math.random() * mockPhrases.length)
          if (!usedIndices.has(index)) {
            usedIndices.add(index)
            selectedPhrases.push(mockPhrases[index])
          }
        }

        // Build output text
        const outputText = `
Request: ${request}

Repository: ${repo}
Environment: ${environment}

Processing...

${selectedPhrases.join('\n')}

Session ID: ${generateSessionId()}
        `.trim()

        // Check if we're updating an existing session or creating a new one
        const currentSession = getCurrentSession()
        if (currentSession) {
          // Update existing session
          updateSession(currentSession.id, {
            request,
            repo,
            environment,
            output: outputText
          })
        } else {
          // Create new session
          createSession(request, repo, environment, outputText)
        }

        // Re-render the page to show updated session
        renderPage('sessions')

        // Scroll to output
        const outputContainer = document.querySelector<HTMLDivElement>('#session-output')
        if (outputContainer) {
          setTimeout(() => {
            outputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }, 100)
        }
      })
    }
  }
}

// Helper function to generate a random session ID
function generateSessionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let id = ''
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}

// Render sessions list in the sidebar
function renderSessionsList(): void {
  const listContainer = document.querySelector('#sessions-list')
  if (!listContainer) return

  const sessions = getSessions()
  const currentSession = getCurrentSession()

  if (sessions.length === 0) {
    listContainer.innerHTML = '<div class="empty-state">No sessions yet. Create one to get started!</div>'
    return
  }

  listContainer.innerHTML = sessions.map(session => {
    const date = new Date(session.createdAt)
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
  listContainer.querySelectorAll('.session-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      // Don't trigger if clicking on action buttons
      if (target.closest('.session-action-btn')) return

      const sessionId = item.getAttribute('data-session-id')
      if (sessionId) {
        setCurrentSession(sessionId)
        renderPage('sessions')
      }
    })
  })

  // Attach edit listeners
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

            const saveEdit = () => {
              const newName = input.value.trim()
              if (newName && newName !== currentName) {
                updateSession(sessionId, { name: newName })
              }
              renderSessionsList()
            }

            input.addEventListener('blur', saveEdit)
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

  // Attach delete listeners
  listContainer.querySelectorAll('.delete-session').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const sessionId = btn.getAttribute('data-session-id')
      if (sessionId && confirm('Are you sure you want to delete this session?')) {
        deleteSession(sessionId)
        renderPage('sessions')
      }
    })
  })
}

// Sidebar state management
const SIDEBAR_STATE_KEY = 'sidebar-collapsed'

function getSidebarState(): boolean {
  const stored = localStorage.getItem(SIDEBAR_STATE_KEY)
  return stored === 'true'
}

function setSidebarState(collapsed: boolean): void {
  localStorage.setItem(SIDEBAR_STATE_KEY, collapsed.toString())
}

function toggleSidebar(): void {
  const sidebar = document.querySelector('.sidebar')
  const appContainer = document.querySelector('.app-container')

  if (sidebar && appContainer) {
    const isCollapsed = sidebar.classList.contains('collapsed')

    if (isCollapsed) {
      sidebar.classList.remove('collapsed')
      appContainer.classList.remove('sidebar-collapsed')
      setSidebarState(false)
    } else {
      sidebar.classList.add('collapsed')
      appContainer.classList.add('sidebar-collapsed')
      setSidebarState(true)
    }
  }
}

// Initialize theme on load
applyTheme(getCurrentTheme())

// Set up HTML structure with sidebar
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="app-container${getSidebarState() ? ' sidebar-collapsed' : ''}">
    <header class="header">
      <div class="header-left">
        <button id="menu-toggle" class="menu-toggle" type="button" aria-label="Toggle menu">
          <span class="hamburger"></span>
        </button>
        <h2 class="app-title">My App</h2>
      </div>
      <h1 class="page-title">${pages.find(p => p.id === getCurrentPage())?.title || 'Home'}</h1>
      <div class="header-right">
        <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle theme">
          ☀️ Light
        </button>
      </div>
    </header>
    <div class="content-wrapper">
      <aside class="sidebar${getSidebarState() ? ' collapsed' : ''}">
        <nav class="sidebar-nav">
          ${pages.map(page => `
            <a href="#${page.id}" class="nav-item" data-page="${page.id}">
              <span class="nav-icon">${page.icon}</span>
              <span class="nav-text">${page.title}</span>
            </a>
          `).join('')}
        </nav>
      </aside>
      <main class="content">
        <div id="page-content" class="page-container">
          <!-- Page content will be rendered here -->
        </div>
      </main>
    </div>
  </div>
`

// Update theme button to show current state
updateThemeButton()

// Set up theme toggle listener
const themeButton = document.querySelector<HTMLButtonElement>('#theme-toggle')!
themeButton.addEventListener('click', toggleTheme)

// Set up menu toggle listener
const menuButton = document.querySelector<HTMLButtonElement>('#menu-toggle')!
menuButton.addEventListener('click', toggleSidebar)

// Set up navigation listeners
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault()
    const pageId = item.getAttribute('data-page')
    if (pageId) {
      navigateToPage(pageId)
    }
  })
})

// Listen for hash changes (browser back/forward)
window.addEventListener('hashchange', () => {
  const currentPage = getCurrentPage()
  renderPage(currentPage)

  // Update page title in header
  const pageTitleElement = document.querySelector<HTMLHeadingElement>('.page-title')
  const page = pages.find(p => p.id === currentPage)
  if (pageTitleElement && page) {
    pageTitleElement.textContent = page.title
  }
})

// Render initial page
renderPage(getCurrentPage())

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  // Only update if user hasn't manually set a preference
  if (!getStoredTheme()) {
    applyTheme(e.matches ? THEME_LIGHT : THEME_DARK)
    updateThemeButton()
  }
})
