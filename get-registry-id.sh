#!/bin/bash

# Get Docker Registry ID from Dokploy
# This script fetches all registries and extracts the ID for dockerregistry.etdofresh.com

set -e

# Check for required environment variables
if [ -z "$DOKPLOY_URL" ] || [ -z "$DOKPLOY_API_KEY" ]; then
  echo "❌ Error: DOKPLOY_URL and DOKPLOY_API_KEY environment variables are required"
  exit 1
fi

# Strip trailing slash from DOKPLOY_URL if present
DOKPLOY_URL="${DOKPLOY_URL%/}"

echo "🔍 Looking for Docker registry 'dockerregistry.etdofresh.com'..."
echo ""

# Get all registries
REGISTRIES=$(curl -s -X 'GET' \
  "${DOKPLOY_URL}/api/trpc/registry.all" \
  -H 'accept: application/json' \
  -H "x-api-key: ${DOKPLOY_API_KEY}")

# Debug: Show raw response
echo "📋 Registry API Response:"
echo "$REGISTRIES" | jq '.' || echo "  (invalid JSON)"
echo ""

# Show all available registries
echo "📋 Available registries:"
echo "$REGISTRIES" | jq -r '.result.data.json[]? | "  - \(.registryName // "unnamed"): \(.registryUrl) (ID: \(.registryId))"' || echo "  (none or error parsing)"
echo ""

# Try to find registry by URL (case-insensitive search)
REGISTRY_DATA=$(echo "$REGISTRIES" | jq -r '.result.data.json[]? | select(.registryUrl | ascii_downcase | contains("dockerregistry.etdofresh.com"))')
REGISTRY_ID=$(echo "$REGISTRY_DATA" | jq -r '.registryId')
REGISTRY_URL=$(echo "$REGISTRY_DATA" | jq -r '.registryUrl')
REGISTRY_NAME=$(echo "$REGISTRY_DATA" | jq -r '.registryName')

if [ -n "$REGISTRY_ID" ] && [ "$REGISTRY_ID" != "null" ]; then
  echo "✅ Found Docker registry!"
  echo ""
  echo "Registry Details:"
  echo "  Name: ${REGISTRY_NAME}"
  echo "  URL: ${REGISTRY_URL}"
  echo "  ID: ${REGISTRY_ID}"
  echo ""
  echo "Add this to your environment variables:"
  echo "  DOKPLOY_REGISTRY_ID=${REGISTRY_ID}"
else
  echo "❌ Docker registry 'dockerregistry.etdofresh.com' not found"
  echo ""
  echo "Available registries listed above. Please verify:"
  echo "  1. The registry exists in Dokploy"
  echo "  2. The URL matches 'dockerregistry.etdofresh.com'"
  echo "  3. Your API key has permission to view registries"
  exit 1
fi
