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

    // Allow all hosts (disable host check for dynamic Dokploy subdomains)
    allowedHosts: ['.etdofresh.com', 'localhost', '127.0.0.1'],

    // HMR configuration for reverse proxy and HTTPS
    hmr: {
      protocol: 'wss',
      host: undefined, // Let Vite use the current page's hostname
      port: 443,
      clientPort: 443,
      path: '/vite-hmr', // Custom path for WebSocket
    },

    // Watch configuration for file changes
    watch: {
      // Poll for changes (useful in Docker volumes on some systems)
      usePolling: true,
      interval: 100,
    },

    // Enable CORS for WebSocket connections
    cors: true,
  },
})
