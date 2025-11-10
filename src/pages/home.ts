export function renderHomePage(): string {
  return `
    <div class="page home-page">
      <div class="page-header">
        <h1>Welcome Home!</h1>
        <p class="subtitle">Your Vite + TypeScript Application</p>
      </div>

      <div class="page-content">
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Powered by Vite for instant hot module replacement</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Theme Support</h3>
            <p>Built-in light and dark theme switching</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🧭</div>
            <h3>Easy Navigation</h3>
            <p>Sidebar navigation for seamless page transitions</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Responsive</h3>
            <p>Works perfectly on all device sizes</p>
          </div>
        </div>

        <div class="card counter-section">
          <h2>Interactive Counter</h2>
          <p>Click the button to increment the counter</p>
          <button id="counter" type="button">Count is 0</button>
        </div>

        <div class="info-section">
          <h2>Getting Started</h2>
          <p>Use the sidebar to navigate between different pages. You can add more pages by:</p>
          <ol>
            <li>Creating a new page file in <code>src/pages/</code></li>
            <li>Adding the route in <code>src/main.ts</code></li>
            <li>The sidebar will automatically update!</li>
          </ol>
        </div>
      </div>
    </div>
  `
}
