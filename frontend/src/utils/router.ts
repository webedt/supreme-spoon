// Router Module - Hash-based client-side routing

import type { Page } from './types'

let pages: Page[] = []
let onPageChangeCallback: ((pageId: string) => void) | null = null

/**
 * Initialize the router with pages and callback
 * @param pagesList Array of page definitions
 * @param onPageChange Callback function when page changes
 */
export function initRouter(pagesList: Page[], onPageChange?: (pageId: string) => void): void {
  pages = pagesList
  if (onPageChange) {
    onPageChangeCallback = onPageChange
  }

  // Listen for hash changes (browser back/forward)
  window.addEventListener('hashchange', () => {
    const currentPage = getCurrentPage()
    if (onPageChangeCallback) {
      onPageChangeCallback(currentPage)
    }
  })
}

/**
 * Get the current page ID from the URL hash
 * @returns Current page ID or 'home' as default
 */
export function getCurrentPage(): string {
  const hash = window.location.hash.slice(1) // Remove the '#'
  return hash || 'home' // Default to home
}

/**
 * Navigate to a specific page
 * @param pageId Page ID to navigate to
 */
export function navigateToPage(pageId: string): void {
  window.location.hash = pageId
}

/**
 * Get page data by ID
 * @param pageId Page ID
 * @returns Page object or default (first) page
 */
export function getPageById(pageId: string): Page {
  return pages.find(p => p.id === pageId) || pages[0]
}

/**
 * Get all pages
 * @returns Array of all page objects
 */
export function getAllPages(): Page[] {
  return pages
}
