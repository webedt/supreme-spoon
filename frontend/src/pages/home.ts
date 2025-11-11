// Home Page Module

import type { Page } from '../utils/types'

export const homePage: Page = {
  id: 'home',
  title: 'Home',
  icon: '🏠',
  render: () => `
    <div class="page-content">
      <h1>Welcome Home!</h1>
      <p class="message">
        This is your home page. Use the sidebar to navigate between different pages.
      </p>
      <div style="margin: 2rem 0;">
        <img
          src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&h=400&fit=crop"
          alt="Modern workspace"
          style="width: 100%; max-width: 800px; height: 400px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);"
        />
      </div>
      <div class="card">
        <h2>Getting Started</h2>
        <p>Explore the modular architecture of this application built with vanilla TypeScript.</p>
        <div style="margin: 1.5rem 0;">
          <img
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=300&fit=crop"
            alt="Coding setup"
            style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;"
          />
        </div>
        <button id="counter" type="button" class="btn-primary">Count is 0</button>
      </div>
    </div>
  `
}

/**
 * Attach event listeners for the home page
 */
export function attachHomeListeners(): void {
  let counter = 0
  const counterButton = document.querySelector<HTMLButtonElement>('#counter')
  if (counterButton) {
    counterButton.addEventListener('click', () => {
      counter++
      counterButton.textContent = `Count is ${counter}`
    })
  }
}
