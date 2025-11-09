import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // Listen on all network interfaces (important for Docker)
    host: '0.0.0.0',

    // Default port
    port: 5173,

    // Automatically open browser on server start (disable in Docker)
    open: false,

    // Enable strict port (fail if port is already in use)
    strictPort: true,

    // Allow all hosts (important for Dokploy dynamic subdomains)
    allowedHosts: ['.etdofresh.com'],

    // HMR configuration for reverse proxy
    // Don't set host - Vite will use the current page's hostname
    hmr: {
      protocol: 'wss',
      clientPort: 443,
    },

    // Watch configuration for file changes
    watch: {
      // Poll for changes (useful in Docker volumes on some systems)
      usePolling: true,
      interval: 100,
    },
  },
})
