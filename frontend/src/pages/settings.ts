// Settings Page Module

import type { Page } from '../utils/types'

export const settingsPage: Page = {
  id: 'settings',
  title: 'Settings',
  icon: '⚙️',
  render: () => `
    <div class="page-content">
      <h1>Settings</h1>
      <p class="message">
        Configure your application preferences here.
      </p>
      <div class="card">
        <h2>Theme Settings</h2>
        <p>Use the theme toggle in the header to switch between different color schemes and fonts.</p>
        <p style="margin-top: 1rem; color: var(--text-secondary);">
          Your theme preference is saved locally and will persist across sessions.
        </p>
      </div>
      <div class="card">
        <h2>Application Info</h2>
        <ul style="text-align: left;">
          <li><strong>Version:</strong> 1.0.0</li>
          <li><strong>Build:</strong> Production</li>
          <li><strong>Framework:</strong> Vanilla TypeScript</li>
        </ul>
      </div>
    </div>
  `
}

/**
 * Attach event listeners for the settings page
 */
export function attachSettingsListeners(): void {
  // No interactive elements on the settings page currently
}
