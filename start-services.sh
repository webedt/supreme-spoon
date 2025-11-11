#!/bin/bash

# Startup script for all three services with health checks

echo "🚀 Starting all services..."
echo ""

# Set default environment variables if not already set
# Note: PORT is NOT set to avoid conflicts between services
export BACKEND_URL=${BACKEND_URL:-http://localhost:3001}
export FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}

echo "Environment Configuration:"
echo "  - Backend URL: ${BACKEND_URL}"
echo "  - Frontend URL: ${FRONTEND_URL}"
echo "  - Database URL: ${DATABASE_URL:-Not set}"
echo "  - Backend will listen on port 3001 (default)"
echo "  - Reverse proxy will listen on port 3000 (default)"
echo ""

# Start all services using npm workspaces
exec npm run dev
