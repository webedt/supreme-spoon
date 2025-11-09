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

    // HMR configuration
    hmr: {
      // Use the host for HMR websocket connection
      // This is important when running in Docker or behind a proxy
      clientPort: 5173,
    },

    // Watch configuration for file changes
    watch: {
      // Poll for changes (useful in Docker volumes on some systems)
      usePolling: true,
      interval: 100,
    },
  },
})
