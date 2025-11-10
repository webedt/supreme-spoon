#!/bin/bash

# Get Docker Registry ID from Dokploy Application Configuration
# This script fetches the application details and extracts the registry ID

set -e

# Check for required environment variables
if [ -z "$DOKPLOY_URL" ] || [ -z "$DOKPLOY_API_KEY" ]; then
  echo "❌ Error: DOKPLOY_URL and DOKPLOY_API_KEY environment variables are required"
  exit 1
fi

# Strip trailing slash from DOKPLOY_URL if present
DOKPLOY_URL="${DOKPLOY_URL%/}"

# Application ID from the Dokploy dashboard URL
APP_ID="V-DvJFgA_wtQ4wpEPKf3v"

echo "🔍 Fetching application details for: ${APP_ID}"
echo ""

# URL encode the JSON parameter
# {"json":{"applicationId":"V-DvJFgA_wtQ4wpEPKf3v"}}
INPUT_PARAM=$(printf '{"json":{"applicationId":"%s"}}' "$APP_ID" | jq -sRr @uri)

# Get application details
APP_DETAILS=$(curl -s -X 'GET' \
  "${DOKPLOY_URL}/api/trpc/application.one?input=${INPUT_PARAM}" \
  -H 'accept: application/json' \
  -H "x-api-key: ${DOKPLOY_API_KEY}")

echo "📋 Full Application Response:"
echo "$APP_DETAILS" | jq '.'
echo ""

# Extract registry-related fields
REGISTRY_ID=$(echo "$APP_DETAILS" | jq -r '.result.data.json.registryId // empty')
DOCKER_REGISTRY_ID=$(echo "$APP_DETAILS" | jq -r '.result.data.json.dockerRegistryId // empty')
REGISTRY_URL=$(echo "$APP_DETAILS" | jq -r '.result.data.json.registryUrl // empty')

echo "=========================================="
echo "🐳 Registry Configuration Found:"
echo "=========================================="
echo ""

if [ -n "$REGISTRY_ID" ] && [ "$REGISTRY_ID" != "null" ]; then
  echo "✅ Registry ID: ${REGISTRY_ID}"
  FOUND_ID="$REGISTRY_ID"
fi

if [ -n "$DOCKER_REGISTRY_ID" ] && [ "$DOCKER_REGISTRY_ID" != "null" ]; then
  echo "✅ Docker Registry ID: ${DOCKER_REGISTRY_ID}"
  FOUND_ID="${FOUND_ID:-$DOCKER_REGISTRY_ID}"
fi

if [ -n "$REGISTRY_URL" ] && [ "$REGISTRY_URL" != "null" ]; then
  echo "✅ Registry URL: ${REGISTRY_URL}"
fi

echo ""

if [ -n "$FOUND_ID" ] && [ "$FOUND_ID" != "null" ]; then
  echo "=========================================="
  echo "Add this to your GitHub repository variables:"
  echo "=========================================="
  echo ""
  echo "  DOKPLOY_REGISTRY_ID=${FOUND_ID}"
  echo ""
else
  echo "⚠️  No registry ID found in application configuration"
  echo ""
  echo "This could mean:"
  echo "  1. The registry hasn't been set in the application settings yet"
  echo "  2. The application is using GitHub provider instead of Docker provider"
  echo "  3. The registry ID field has a different name in the API response"
  echo ""
  echo "Try running the other script to fetch all registries:"
  echo "  ./get-registry-id.sh"
fi
