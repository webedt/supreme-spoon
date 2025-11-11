// Main Application Entry Point
// Clean, modular orchestration of components

import './styles/main.css'

// Import utilities
import { applyTheme, getCurrentTheme, watchSystemTheme } from './utils/theme'
import { initRouter, getCurrentPage, getPageById } from './utils/router'

// Import components
import { renderHeader, updatePageTitle, updateDocumentTitle, attachHeaderListeners, updateThemeButton } from './components/header'
import { renderSidebar, getSidebarState, toggleSidebar, updateActiveNavItem, attachSidebarListeners } from './components/sidebar'

// Import pages
import { homePage, attachHomeListeners } from './pages/home'
import { sessionsPage, attachSessionsListeners } from './pages/sessions'
import { aboutPage, attachAboutListeners } from './pages/about'
import { settingsPage, attachSettingsListeners } from './pages/settings'

// Define all pages
const pages = [homePage, sessionsPage, aboutPage, settingsPage]

/**
 * Render a page by ID
 * @param pageId Page ID to render
 */
function renderPage(pageId: string): void {
  const page = getPageById(pageId)
  const contentArea = document.querySelector<HTMLDivElement>('#page-content')

  if (contentArea) {
    contentArea.innerHTML = page.render()

    // Update active state in sidebar
    updateActiveNavItem(pageId)

    // Update page title in header
    updatePageTitle(page.title)

    // Update document title
    updateDocumentTitle()

    // Attach page-specific event listeners
    attachPageEventListeners(pageId)
  }
}

/**
 * Attach event listeners for dynamic page content
 * @param pageId Page ID to attach listeners for
 */
function attachPageEventListeners(pageId: string): void {
  switch (pageId) {
    case 'home':
      attachHomeListeners()
      break
    case 'sessions':
      attachSessionsListeners()
      break
    case 'about':
      attachAboutListeners()
      break
    case 'settings':
      attachSettingsListeners()
      break
  }
}

/**
 * Initialize the application
 */
function init(): void {
  // Initialize theme
  applyTheme(getCurrentTheme())

  // Initialize router
  initRouter(pages, (pageId) => {
    renderPage(pageId)
  })

  // Get current page
  const currentPage = getCurrentPage()
  const currentPageTitle = getPageById(currentPage).title

  // Set up HTML structure
  const appContainer = document.querySelector<HTMLDivElement>('#app')
  if (appContainer) {
    appContainer.innerHTML = `
      <div class="app-container${getSidebarState() ? ' sidebar-collapsed' : ''}">
        ${renderHeader(currentPageTitle)}
        <div class="content-wrapper">
          ${renderSidebar(pages, currentPage)}
          <main class="content">
            <div id="page-content" class="page-container">
              <!-- Page content will be rendered here -->
            </div>
          </main>
        </div>
      </div>
    `
  }

  // Attach event listeners
  attachHeaderListeners(toggleSidebar)
  attachSidebarListeners()

  // Render initial page
  renderPage(currentPage)

  // Listen for custom render page events (from sessions page)
  window.addEventListener('renderPage', ((e: CustomEvent) => {
    const { pageId } = e.detail
    renderPage(pageId)
  }) as EventListener)

  // Watch for system theme changes
  watchSystemTheme((newTheme) => {
    applyTheme(newTheme)
    updateThemeButton()
    updateDocumentTitle()
  })
}

// Initialize the application when DOM is ready
init()
