// Type Definitions

export interface Session {
  id: string
  name: string
  request: string
  repo: string
  environment: string
  output: string
  created_at?: string
  updated_at?: string
  createdAt?: string  // For backwards compatibility
  updatedAt?: string  // For backwards compatibility
}

export interface ThemeOption {
  id: string
  name: string
  icon: string
}

export interface Page {
  id: string
  title: string
  icon: string
  render: () => string
}
