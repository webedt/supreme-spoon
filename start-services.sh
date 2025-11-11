#!/bin/bash

# Startup script for all three services with health checks

echo "🚀 Starting all services..."
echo ""

# Set default environment variables if not already set
export PORT=${PORT:-3000}
export BACKEND_URL=${BACKEND_URL:-http://localhost:3001}
export FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}

echo "Environment Configuration:"
echo "  - Reverse Proxy Port: ${PORT}"
echo "  - Backend URL: ${BACKEND_URL}"
echo "  - Frontend URL: ${FRONTEND_URL}"
echo "  - Database URL: ${DATABASE_URL:-Not set}"
echo ""

# Start all services using npm workspaces
exec npm run dev
