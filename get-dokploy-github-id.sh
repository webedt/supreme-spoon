#!/bin/bash

# Script to get your DOKPLOY_GITHUB_ID from Dokploy API
# This ID is required for the GitHub Actions workflow

echo "================================================"
echo "  Dokploy GitHub ID Finder"
echo "================================================"
echo ""

# Check if environment variables are set
if [ -z "$DOKPLOY_URL" ]; then
  echo "❌ Error: DOKPLOY_URL environment variable is not set"
  echo ""
  echo "Usage:"
  echo "  export DOKPLOY_URL='https://dokploy.etdofresh.com'"
  echo "  export DOKPLOY_API_KEY='your-api-key-here'"
  echo "  ./get-dokploy-github-id.sh"
  exit 1
fi

if [ -z "$DOKPLOY_API_KEY" ]; then
  echo "❌ Error: DOKPLOY_API_KEY environment variable is not set"
  echo ""
  echo "Usage:"
  echo "  export DOKPLOY_URL='https://dokploy.etdofresh.com'"
  echo "  export DOKPLOY_API_KEY='your-api-key-here'"
  echo "  ./get-dokploy-github-id.sh"
  exit 1
fi

# Strip trailing slash from DOKPLOY_URL
DOKPLOY_URL="${DOKPLOY_URL%/}"

echo "🔍 Fetching GitHub providers from Dokploy..."
echo "   URL: ${DOKPLOY_URL}"
echo ""

# Fetch GitHub providers
RESPONSE=$(curl -s -w "\n%{http_code}" -X 'GET' \
  "${DOKPLOY_URL}/api/trpc/github.githubProviders" \
  -H 'accept: application/json' \
  -H "x-api-key: ${DOKPLOY_API_KEY}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "✅ Successfully fetched GitHub providers"
  echo ""

  # Check if jq is available
  if ! command -v jq &> /dev/null; then
    echo "⚠️  Warning: jq is not installed. Showing raw response:"
    echo ""
    echo "$BODY"
    echo ""
    echo "Install jq for better formatting: sudo apt-get install jq"
    exit 0
  fi

  # Parse and display GitHub providers
  PROVIDERS=$(echo "$BODY" | jq -r '.result.data.json // .result.data // []')

  if [ "$PROVIDERS" = "[]" ] || [ "$PROVIDERS" = "null" ]; then
    echo "⚠️  No GitHub providers found in your Dokploy instance"
    echo ""
    echo "You need to:"
    echo "1. Log into your Dokploy instance at: ${DOKPLOY_URL}"
    echo "2. Go to Settings → Git Providers"
    echo "3. Add a GitHub provider (GitHub App)"
    echo "4. Then run this script again"
    exit 0
  fi

  echo "📋 Available GitHub Providers:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Display each provider
  echo "$BODY" | jq -r '.result.data.json // .result.data // [] |
    to_entries[] |
    "\n[\(.key + 1)] Provider:\n" +
    "   Name:          \(.value.name // "N/A")\n" +
    "   GitHub App:    \(.value.githubAppName // "N/A")\n" +
    "   GitHub ID:     \(.value.githubId // "N/A")\n" +
    "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"'

  echo ""
  echo "📝 Next Steps:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "1. Copy the 'GitHub ID' value from the provider you want to use"
  echo "2. Go to your GitHub repository:"
  echo "   https://github.com/webedt/supreme-spoon"
  echo ""
  echo "3. Navigate to: Settings → Secrets and variables → Actions → Variables"
  echo ""
  echo "4. Click 'New repository variable'"
  echo "   - Name: DOKPLOY_GITHUB_ID"
  echo "   - Value: [paste the GitHub ID from above]"
  echo ""
  echo "5. Save and re-run your GitHub Actions workflow"
  echo ""

  # Extract first githubId for easy copying
  FIRST_GITHUB_ID=$(echo "$BODY" | jq -r '(.result.data.json // .result.data // [])[0].githubId // empty')

  if [ -n "$FIRST_GITHUB_ID" ]; then
    echo "💡 Quick Copy (if you have only one provider):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "   DOKPLOY_GITHUB_ID=$FIRST_GITHUB_ID"
    echo ""
  fi

else
  echo "❌ Failed to fetch GitHub providers (HTTP ${HTTP_CODE})"
  echo ""
  echo "Response:"
  echo "$BODY"
  echo ""

  if [ "$HTTP_CODE" = "401" ]; then
    echo "💡 This looks like an authentication error. Check that:"
    echo "   - Your DOKPLOY_API_KEY is correct"
    echo "   - The API key hasn't expired"
    echo "   - You generated the key from: ${DOKPLOY_URL}/settings/profile"
  fi

  exit 1
fi
