import './style.css'
import { router } from './router'
import { Sidebar } from './sidebar'
import { renderHomePage } from './pages/home'

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

// Initialize theme on load
applyTheme(getCurrentTheme())

// Register routes
router.addRoute({
  path: '/',
  title: 'Home',
  render: renderHomePage
})

// Set up HTML structure
const appElement = document.querySelector<HTMLDivElement>('#app')!
appElement.innerHTML = `
  <div id="sidebar-container"></div>
  <div class="main-wrapper">
    <header class="header">
      <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle theme">
        ☀️ Light
      </button>
    </header>
    <div class="content">
      <div class="main-content" id="main-content">
        <!-- Content will be rendered here by router -->
      </div>
    </div>
  </div>
`

// Initialize sidebar
const sidebar = new Sidebar()
const sidebarContainer = document.querySelector('#sidebar-container')!
sidebarContainer.appendChild(sidebar.getElement())
sidebar.updateNavigation()

// Set content element for router
const contentElement = document.querySelector<HTMLElement>('#main-content')!
router.setContentElement(contentElement)

// Update theme button to show current state
updateThemeButton()

// Set up theme toggle listener
const themeButton = document.querySelector<HTMLButtonElement>('#theme-toggle')!
themeButton.addEventListener('click', toggleTheme)

// Set up counter button listener (delegated)
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (target.id === 'counter') {
    const button = target as HTMLButtonElement
    const currentCount = parseInt(button.textContent?.match(/\d+/)?.[0] || '0')
    button.textContent = `Count is ${currentCount + 1}`
  }
})

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  // Only update if user hasn't manually set a preference
  if (!getStoredTheme()) {
    applyTheme(e.matches ? THEME_LIGHT : THEME_DARK)
    updateThemeButton()
  }
})

// Initial navigation (trigger route rendering)
window.dispatchEvent(new Event('hashchange'))
