import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { createServer } from 'http'

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3000

// Configuration for backend and frontend
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

console.log('🔧 Reverse Proxy Configuration:')
console.log(`  - Proxy Port: ${PORT}`)
console.log(`  - Backend URL: ${BACKEND_URL}`)
console.log(`  - Frontend URL: ${FRONTEND_URL}`)

// Health check for reverse proxy
app.get('/proxy-health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'reverse-proxy',
    backend: BACKEND_URL,
    frontend: FRONTEND_URL,
    timestamp: new Date().toISOString()
  })
})

// Proxy /api/* and /health to backend
const backendProxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  logLevel: 'info',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔀 [Backend] ${req.method} ${req.path}`)
  },
  onError: (err, req, res) => {
    console.error(`❌ [Backend Proxy Error] ${err.message}`)
    res.status(502).json({ error: 'Backend service unavailable', details: err.message })
  }
})

app.use('/api', backendProxy)
app.use('/health', backendProxy)

// Proxy everything else to frontend (including WebSocket for HMR)
const frontendProxy = createProxyMiddleware({
  target: FRONTEND_URL,
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying for HMR
  logLevel: 'info',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔀 [Frontend] ${req.method} ${req.path}`)
  },
  onError: (err, req, res) => {
    console.error(`❌ [Frontend Proxy Error] ${err.message}`)
    res.status(502).json({ error: 'Frontend service unavailable', details: err.message })
  }
})

app.use('/', frontendProxy)

// Handle WebSocket upgrade for HMR
server.on('upgrade', (req, socket, head) => {
  const url = req.url || '/'
  console.log(`🔌 WebSocket upgrade request: ${url}`)

  // Proxy all WebSocket upgrades to frontend (for HMR)
  if (!url.startsWith('/api') && url !== '/health') {
    frontendProxy.upgrade(req, socket, head)
  }
})

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Reverse Proxy running on port ${PORT}`)
  console.log(`📡 Routes:`)
  console.log(`   - /api/* → ${BACKEND_URL}`)
  console.log(`   - /health → ${BACKEND_URL}`)
  console.log(`   - /* → ${FRONTEND_URL}`)
  console.log(`🔥 HMR WebSocket proxying enabled`)
})
