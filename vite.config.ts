import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // Listen on all network interfaces (important for Docker)
    host: true,

    // Default port
    port: 5173,

    // Automatically open browser on server start (disable in Docker)
    open: false,

    // Enable strict port (fail if port is already in use)
    strictPort: true,

    // HMR configuration for reverse proxy and HTTPS
    hmr: {
      protocol: 'wss',
      port: 443,
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
