// Theme Management Module

import type { ThemeOption } from './types'

const THEME_KEY = 'theme'

export const themes: ThemeOption[] = [
  { id: 'dark', name: 'Dark', icon: '🌙' },
  { id: 'light', name: 'Light', icon: '☀️' },
  { id: 'blue', name: 'Ocean Blue', icon: '🌊' },
  { id: 'purple', name: 'Purple Dream', icon: '💜' },
  { id: 'green', name: 'Forest Green', icon: '🌲' },
  { id: 'sunset', name: 'Sunset', icon: '🌅' },
  { id: 'rose', name: 'Rose Pink', icon: '🌹' },
  { id: 'retro', name: 'Retro', icon: '👾' }
]

/**
 * Get the stored theme from localStorage
 * @returns Stored theme ID or null
 */
export function getStoredTheme(): string | null {
  return localStorage.getItem(THEME_KEY)
}

/**
 * Save theme to localStorage
 * @param theme Theme ID to store
 */
export function setStoredTheme(theme: string): void {
  localStorage.setItem(THEME_KEY, theme)
}

/**
 * Get the system/OS theme preference
 * @returns 'light' or 'dark'
 */
export function getSystemTheme(): string {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/**
 * Get the current active theme (stored or system default)
 * @returns Current theme ID
 */
export function getCurrentTheme(): string {
  return getStoredTheme() ?? getSystemTheme()
}

/**
 * Apply a theme to the document
 * @param theme Theme ID to apply
 */
export function applyTheme(theme: string): void {
  const root = document.documentElement
  // Remove all theme classes
  themes.forEach(t => root.classList.remove(t.id))
  // Add the selected theme class
  root.classList.add(theme)
}

/**
 * Select and apply a new theme
 * @param themeId Theme ID to select
 */
export function selectTheme(themeId: string): void {
  setStoredTheme(themeId)
  applyTheme(themeId)
}

/**
 * Get theme data by ID
 * @param themeId Theme ID
 * @returns Theme option object or default theme
 */
export function getThemeById(themeId: string): ThemeOption {
  return themes.find(t => t.id === themeId) || themes[0]
}

/**
 * Listen for system theme changes
 * @param callback Function to call when system theme changes
 */
export function watchSystemTheme(callback: (theme: string) => void): void {
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    // Only update if user hasn't manually set a preference
    if (!getStoredTheme()) {
      const newTheme = e.matches ? 'light' : 'dark'
      callback(newTheme)
    }
  })
}
