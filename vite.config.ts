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

    // HMR configuration for hot reloading
    // Use client port for WebSocket connection through reverse proxy
    hmr: {
      clientPort: 443, // Connect through HTTPS port
      protocol: 'wss', // Use secure WebSocket for HTTPS
    },

    // Watch configuration for file changes (still useful for detecting changes)
    watch: {
      // Poll for changes (useful in Docker volumes on some systems)
      usePolling: true,
      interval: 100,
    },

    // Enable CORS
    cors: true,

    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
