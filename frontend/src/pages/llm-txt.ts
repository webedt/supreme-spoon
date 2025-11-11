// LLM.txt Page Module
// Displays complete repository source code

import type { Page } from '../utils/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const llmTxtPage: Page = {
  id: 'llm-txt',
  title: 'llm.txt',
  icon: '📄',
  render: () => `
    <div class="page-content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h1>llm.txt</h1>
        <button id="raw-button" class="raw-button" type="button">View Raw</button>
      </div>
      <p class="message">
        Complete repository source code in a single text file (excluding .gitignore files).
      </p>
      <div class="card" style="max-width: 100%;">
        <div id="llm-content" style="white-space: pre-wrap; font-family: monospace; font-size: 0.85rem; line-height: 1.4; max-height: 70vh; overflow: auto; background: rgba(0, 0, 0, 0.2); padding: 1rem; border-radius: 8px;">
          <div style="text-align: center; padding: 2rem; color: #888;">Loading...</div>
        </div>
      </div>
    </div>
  `
}

/**
 * Attach event listeners for the llm.txt page
 */
export function attachLlmTxtListeners(): void {
  // Fetch and display llm.txt content
  const contentElement = document.querySelector<HTMLDivElement>('#llm-content')
  const rawButton = document.querySelector<HTMLButtonElement>('#raw-button')

  if (contentElement) {
    const url = `${API_BASE_URL}/api/llm-txt`
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch llm.txt: ${response.status} ${response.statusText}`)
        }
        return response.text()
      })
      .then(text => {
        contentElement.textContent = text
      })
      .catch(error => {
        console.error('Error fetching llm.txt:', error)
        contentElement.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #ff6b6b;">
            <p>Error loading content</p>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">${error.message}</p>
          </div>
        `
      })
  }

  if (rawButton) {
    rawButton.addEventListener('click', () => {
      // Open raw content in a new tab
      const url = `${API_BASE_URL}/api/llm-txt`
      window.open(url, '_blank')
    })
  }
}
