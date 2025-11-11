// Sidebar Component Module

import type { Page } from '../utils/types'
import { navigateToPage } from '../utils/router'

const SIDEBAR_STATE_KEY = 'sidebar-collapsed'

/**
 * Render the sidebar HTML
 * @param pages Array of page definitions
 * @param currentPageId Current active page ID
 * @returns Sidebar HTML string
 */
export function renderSidebar(pages: Page[], currentPageId: string): string {
  const isCollapsed = getSidebarState()
  return `
    <aside class="sidebar${isCollapsed ? ' collapsed' : ''}">
      <nav class="sidebar-nav">
        ${pages.map(page => `
          <a href="#${page.id}" class="nav-item${page.id === currentPageId ? ' active' : ''}" data-page="${page.id}">
            <span class="nav-icon">${page.icon}</span>
            <span class="nav-text">${page.title}</span>
          </a>
        `).join('')}
      </nav>
    </aside>
  `
}

/**
 * Get sidebar collapsed state from localStorage
 * @returns true if sidebar is collapsed, false otherwise
 */
export function getSidebarState(): boolean {
  const stored = localStorage.getItem(SIDEBAR_STATE_KEY)
  return stored === 'true'
}

/**
 * Save sidebar state to localStorage
 * @param collapsed Whether sidebar is collapsed
 */
export function setSidebarState(collapsed: boolean): void {
  localStorage.setItem(SIDEBAR_STATE_KEY, collapsed.toString())
}

/**
 * Toggle sidebar visibility
 */
export function toggleSidebar(): void {
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

/**
 * Update active nav item
 * @param pageId Page ID to mark as active
 */
export function updateActiveNavItem(pageId: string): void {
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-page') === pageId) {
      item.classList.add('active')
    } else {
      item.classList.remove('active')
    }
  })
}

/**
 * Attach event listeners to sidebar navigation items
 */
export function attachSidebarListeners(): void {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault()
      const pageId = item.getAttribute('data-page')
      if (pageId) {
        navigateToPage(pageId)
      }
    })
  })
}
