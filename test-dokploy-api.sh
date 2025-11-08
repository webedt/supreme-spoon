#!/bin/bash
# Dokploy API Test Script
# This script demonstrates how to use the Dokploy API endpoints

# Configuration from environment variables
DOKPLOY_URL="${DOKPLOY_URL:-https://dokploy.etdofresh.com}"
DOKPLOY_API_KEY="${DOKPLOY_API:-your-api-key-here}"

# Remove trailing slash from URL if present
DOKPLOY_URL="${DOKPLOY_URL%/}"

echo "========================================="
echo "Dokploy API Test Script"
echo "========================================="
echo "API Base URL: ${DOKPLOY_URL}"
echo "API Key: ${DOKPLOY_API_KEY:0:20}..."
echo ""

# Test 1: Get all projects
echo "Test 1: Fetching all projects..."
echo "Endpoint: ${DOKPLOY_URL}/api/project.all"
echo ""

curl -X GET \
  "${DOKPLOY_URL}/api/project.all" \
  -H 'accept: application/json' \
  -H "x-api-key: ${DOKPLOY_API_KEY}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "========================================="
echo ""

# Test 2: Deploy application (example - requires valid applicationId)
echo "Test 2: Deploy Application (Example)"
echo "Endpoint: ${DOKPLOY_URL}/api/trpc/application.deploy"
echo "Note: This would deploy an application if you have a valid applicationId"
echo ""
echo "Example command:"
echo "curl -X POST \\"
echo "  '${DOKPLOY_URL}/api/trpc/application.deploy' \\"
echo "  -H 'accept: application/json' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'x-api-key: ${DOKPLOY_API_KEY}' \\"
echo "  -d '{\"json\": {\"applicationId\": \"your-app-id\"}}'"
echo ""

# Uncomment to test deploy (you need a valid applicationId)
# APP_ID="your-application-id-here"
# curl -X POST \
#   "${DOKPLOY_URL}/api/trpc/application.deploy" \
#   -H 'accept: application/json' \
#   -H 'Content-Type: application/json' \
#   -H "x-api-key: ${DOKPLOY_API_KEY}" \
#   -d "{\"json\": {\"applicationId\": \"${APP_ID}\"}}" \
#   -w "\nHTTP Status: %{http_code}\n"

echo "========================================="
echo ""

# Test 3: Start application (example)
echo "Test 3: Start Application (Example)"
echo "Endpoint: ${DOKPLOY_URL}/api/trpc/application.start"
echo ""
echo "This endpoint would start a stopped application"
echo ""

echo "========================================="
echo ""

# Test 4: Database operations example
echo "Test 4: Database Operations (Example)"
echo ""
echo "PostgreSQL Start: ${DOKPLOY_URL}/api/trpc/postgres.start"
echo "PostgreSQL Stop: ${DOKPLOY_URL}/api/trpc/postgres.stop"
echo ""
echo "MySQL Start: ${DOKPLOY_URL}/api/trpc/mysql.start"
echo "MySQL Stop: ${DOKPLOY_URL}/api/trpc/mysql.stop"
echo ""
echo "Redis Start: ${DOKPLOY_URL}/api/trpc/redis.start"
echo "Redis Stop: ${DOKPLOY_URL}/api/trpc/redis.stop"
echo ""

echo "========================================="
echo "Test Complete"
echo "========================================="
