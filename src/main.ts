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

// Initialize theme on load
applyTheme(getCurrentTheme())

// Set up HTML structure
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="header">
    <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle theme">
      ☀️ Light
    </button>
  </header>
  <div class="content">
    <div class="main-content">
      <h1>Hello World!</h1>
      <p class="message">
        Welcome to your Vite + TypeScript project
      </p>
      <div class="card">
        <button id="counter" type="button">Count is 200</button>
      </div>
    </div>
  </div>
`

// Update theme button to show current state
updateThemeButton()

// Set up theme toggle listener
const themeButton = document.querySelector<HTMLButtonElement>('#theme-toggle')!
themeButton.addEventListener('click', toggleTheme)

// Set up counter button
let counter = 200
const counterButton = document.querySelector<HTMLButtonElement>('#counter')!
counterButton.addEventListener('click', () => {
  counter++
  counterButton.textContent = `Count is ${counter}`
})

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  // Only update if user hasn't manually set a preference
  if (!getStoredTheme()) {
    applyTheme(e.matches ? THEME_LIGHT : THEME_DARK)
    updateThemeButton()
  }
})
