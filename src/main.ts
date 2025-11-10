import './style.css'

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
