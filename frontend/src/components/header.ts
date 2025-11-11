// Header Component Module

import { getPageById, getCurrentPage } from '../utils/router'
import { themes, getCurrentTheme, selectTheme, getThemeById } from '../utils/theme'

/**
 * Render the header HTML
 * @param currentPageTitle Title of the current page
 * @returns Header HTML string
 */
export function renderHeader(currentPageTitle: string): string {
  return `
    <header class="header">
      <div class="header-left">
        <button id="menu-toggle" class="menu-toggle" type="button" aria-label="Toggle menu">
          <span class="hamburger"></span>
        </button>
        <h2 class="app-title">Example Application</h2>
      </div>
      <h1 class="page-title">${currentPageTitle}</h1>
      <div class="header-right">
        <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Select theme">
          ☀️ Light
        </button>
        ${renderThemeDropdown()}
      </div>
    </header>
  `
}

/**
 * Render the theme dropdown HTML
 * @returns Theme dropdown HTML string
 */
function renderThemeDropdown(): string {
  const currentTheme = getCurrentTheme()
  return `
    <div id="theme-dropdown" class="theme-dropdown">
      ${themes.map(theme => `
        <button
          class="theme-option ${theme.id === currentTheme ? 'active' : ''}"
          data-theme="${theme.id}"
        >
          <span class="theme-option-icon">${theme.icon}</span>
          <span class="theme-option-name">${theme.name}</span>
        </button>
      `).join('')}
    </div>
  `
}

/**
 * Update the theme button text based on dropdown state
 */
export function updateThemeButton(): void {
  const button = document.querySelector<HTMLButtonElement>('#theme-toggle')
  const dropdown = document.querySelector<HTMLDivElement>('#theme-dropdown')
  if (button) {
    const currentTheme = getCurrentTheme()
    const theme = getThemeById(currentTheme)
    const isExpanded = dropdown?.classList.contains('show')

    // Show only emoji when collapsed, emoji + text when expanded
    if (isExpanded) {
      button.innerHTML = `${theme.icon} ${theme.name} <span style="margin-left: 0.25rem;">▼</span>`
    } else {
      button.innerHTML = `${theme.icon} <span style="margin-left: 0.25rem;">▼</span>`
    }
  }
}

/**
 * Update the page title in the header
 * @param title New page title
 */
export function updatePageTitle(title: string): void {
  const pageTitleElement = document.querySelector<HTMLHeadingElement>('.page-title')
  if (pageTitleElement) {
    pageTitleElement.textContent = title
  }
}

/**
 * Update the document title (browser tab)
 */
export function updateDocumentTitle(): void {
  const currentTheme = getCurrentTheme()
  const theme = getThemeById(currentTheme)
  const currentPage = getCurrentPage()
  const page = getPageById(currentPage)

  document.title = `${page.title} ${theme.icon} - Example Application`
}

/**
 * Toggle the theme dropdown visibility
 */
export function toggleThemeDropdown(): void {
  const dropdown = document.querySelector<HTMLDivElement>('#theme-dropdown')
  if (dropdown) {
    const wasHidden = !dropdown.classList.contains('show')
    dropdown.classList.toggle('show')
    updateThemeButton() // Update button to show/hide text based on dropdown state

    // Focus the currently active theme when opening the dropdown
    if (wasHidden && dropdown.classList.contains('show')) {
      const activeOption = dropdown.querySelector<HTMLButtonElement>('.theme-option.active')
      if (activeOption) {
        // Use setTimeout to ensure the dropdown is visible before focusing
        setTimeout(() => activeOption.focus(), 0)
      }
    }
  }
}

/**
 * Close the theme dropdown
 */
export function closeThemeDropdown(): void {
  const dropdown = document.querySelector<HTMLDivElement>('#theme-dropdown')
  if (dropdown) {
    dropdown.classList.remove('show')
    updateThemeButton() // Update button to show only emoji when closed
  }
}

/**
 * Attach event listeners to header elements
 * @param onMenuToggle Callback for menu toggle
 */
export function attachHeaderListeners(onMenuToggle: () => void): void {
  // Set up theme toggle listener
  const themeButton = document.querySelector<HTMLButtonElement>('#theme-toggle')
  if (themeButton) {
    themeButton.addEventListener('click', (e) => {
      e.stopPropagation()
      toggleThemeDropdown()
    })
  }

  // Set up theme option listeners
  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation()
      const themeId = option.getAttribute('data-theme')
      if (themeId) {
        selectTheme(themeId)
        updateThemeButton()
        updateDocumentTitle()

        // Update the active class on theme options
        document.querySelectorAll('.theme-option').forEach(opt => {
          if (opt.getAttribute('data-theme') === themeId) {
            opt.classList.add('active')
          } else {
            opt.classList.remove('active')
          }
        })

        closeThemeDropdown()
      }
    })
  })

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    closeThemeDropdown()
  })

  // Set up menu toggle listener
  const menuButton = document.querySelector<HTMLButtonElement>('#menu-toggle')
  if (menuButton) {
    menuButton.addEventListener('click', onMenuToggle)
  }

  // Initialize theme button
  updateThemeButton()
}
