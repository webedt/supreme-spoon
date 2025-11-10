import { router } from './router'

export class Sidebar {
  private element: HTMLElement
  private isOpen: boolean = true

  constructor() {
    this.element = this.createElement()
    this.attachEventListeners()
  }

  private createElement(): HTMLElement {
    const sidebar = document.createElement('aside')
    sidebar.className = 'sidebar'
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <h2 class="sidebar-title">Navigation</h2>
        <button class="sidebar-toggle" aria-label="Toggle sidebar">
          <span class="hamburger"></span>
        </button>
      </div>
      <nav class="sidebar-nav">
        <ul class="nav-list" id="nav-list">
        </ul>
      </nav>
    `
    return sidebar
  }

  private attachEventListeners(): void {
    // Toggle sidebar
    const toggleBtn = this.element.querySelector('.sidebar-toggle')
    toggleBtn?.addEventListener('click', () => this.toggle())

    // Update active link on route change
    window.addEventListener('hashchange', () => this.updateActiveLink())
  }

  private toggle(): void {
    this.isOpen = !this.isOpen
    this.element.classList.toggle('collapsed', !this.isOpen)
  }

  private updateActiveLink(): void {
    const currentPath = router.getCurrentPath()
    const links = this.element.querySelectorAll('.nav-link')

    links.forEach(link => {
      const path = link.getAttribute('data-path')
      if (path === currentPath) {
        link.classList.add('active')
      } else {
        link.classList.remove('active')
      }
    })
  }

  public updateNavigation(): void {
    const navList = this.element.querySelector('#nav-list')
    if (!navList) return

    const routes = router.getRoutes()
    navList.innerHTML = routes.map(route => `
      <li class="nav-item">
        <a href="#${route.path}" class="nav-link" data-path="${route.path}">
          <span class="nav-icon">${this.getIconForPath(route.path)}</span>
          <span class="nav-text">${route.title}</span>
        </a>
      </li>
    `).join('')

    this.updateActiveLink()
  }

  private getIconForPath(path: string): string {
    const icons: Record<string, string> = {
      '/': '🏠',
      '/about': 'ℹ️',
      '/services': '⚙️',
      '/contact': '📧',
      '/settings': '⚙️'
    }
    return icons[path] || '📄'
  }

  public getElement(): HTMLElement {
    return this.element
  }
}
