// Simple hash-based router for navigation
export type Route = {
  path: string
  title: string
  render: () => string
}

class Router {
  private routes: Map<string, Route> = new Map()
  private currentPath: string = '/'
  private contentElement: HTMLElement | null = null

  constructor() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRouteChange())
    window.addEventListener('load', () => this.handleRouteChange())
  }

  // Register a route
  addRoute(route: Route): void {
    this.routes.set(route.path, route)
  }

  // Set the content container element
  setContentElement(element: HTMLElement): void {
    this.contentElement = element
  }

  // Navigate to a path
  navigate(path: string): void {
    window.location.hash = path
  }

  // Handle route changes
  private handleRouteChange(): void {
    const hash = window.location.hash.slice(1) || '/'
    this.currentPath = hash
    this.render()
  }

  // Render the current route
  private render(): void {
    if (!this.contentElement) return

    const route = this.routes.get(this.currentPath)

    if (route) {
      this.contentElement.innerHTML = route.render()
      document.title = `${route.title} - Vite + TypeScript`
    } else {
      // 404 page
      this.contentElement.innerHTML = `
        <div class="error-page">
          <h1>404</h1>
          <p>Page not found</p>
          <button onclick="window.location.hash = '/'">Go Home</button>
        </div>
      `
      document.title = '404 - Page Not Found'
    }
  }

  // Get current path
  getCurrentPath(): string {
    return this.currentPath
  }

  // Get all routes
  getRoutes(): Route[] {
    return Array.from(this.routes.values())
  }
}

// Create and export a singleton instance
export const router = new Router()
