// About Page Module

import type { Page } from '../utils/types'

export const aboutPage: Page = {
  id: 'about',
  title: 'About Us',
  icon: 'ℹ️',
  render: () => `
    <div class="page-content">
      <h1>About Us</h1>
      <p class="message">
        This is a multi-page application built with vanilla TypeScript and Vite featuring a clean, modular architecture.
      </p>
      <div style="margin: 2rem 0;">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop"
          alt="Team collaboration"
          style="width: 100%; max-width: 800px; height: 400px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);"
        />
      </div>
      <div class="card">
        <h2>Features</h2>
        <div style="margin: 1.5rem 0;">
          <img
            src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=250&fit=crop"
            alt="Technology"
            style="width: 100%; max-width: 600px; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;"
          />
        </div>
        <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
          <li>✨ Modular architecture with separated concerns</li>
          <li>📁 Component-based organization</li>
          <li>🎨 Multiple theme options</li>
          <li>🧭 Hash-based routing</li>
          <li>💻 TypeScript support</li>
          <li>⚡ Vite for fast development</li>
        </ul>
      </div>
    </div>
  `
}

/**
 * Attach event listeners for the about page
 */
export function attachAboutListeners(): void {
  // No interactive elements on the about page currently
}
