#!/bin/bash
# Script to calculate the deployment URL based on the GitHub Actions workflow logic
# This matches the naming strategy in .github/workflows/deploy-dokploy.yml

set -e

# Get repository information from git
OWNER=$(git config --get remote.origin.url | sed -n 's#.*/\([^/]*\)/[^/]*$#\1#p' | tr '[:upper:]' '[:lower:]' | tr '/' '-')
REPO=$(basename -s .git $(git config --get remote.origin.url) | tr '[:upper:]' '[:lower:]')
BRANCH=$(git rev-parse --abbrev-ref HEAD | tr '[:upper:]' '[:lower:]' | tr '/' '-')

# DNS subdomain limit is 63 characters
MAX_LENGTH=63

# Function to extract unique part of branch name (matches workflow logic)
extract_branch_unique() {
  local branch="$1"
  # Try to extract meaningful parts: PR numbers, issue numbers, or last segment
  if [[ "$branch" =~ ^.*-([0-9]+)$ ]]; then
    # If branch ends with number (like pr-123, issue-456), extract it
    echo "${BASH_REMATCH[1]}"
  elif [[ "$branch" =~ /([^/]+)$ ]]; then
    # If branch has slashes, get last segment
    echo "${BASH_REMATCH[1]}"
  else
    # Otherwise, get last part after last dash
    echo "${branch##*-}"
  fi
}

# Progressive fallback strategy for DOMAIN name to fit within 63 character subdomain limit
# Strategy 1: owner-repo-branch (most specific)
CANDIDATE="${OWNER}-${REPO}-${BRANCH}"
if [ ${#CANDIDATE} -le $MAX_LENGTH ]; then
  DOMAIN_NAME="$CANDIDATE"
  STRATEGY="1 (owner-repo-branch)"
else
  # Strategy 2: repo-branch (drop owner)
  CANDIDATE="${REPO}-${BRANCH}"
  if [ ${#CANDIDATE} -le $MAX_LENGTH ]; then
    DOMAIN_NAME="$CANDIDATE"
    STRATEGY="2 (repo-branch)"
  else
    # Extract unique part of branch for further compression
    BRANCH_UNIQUE=$(extract_branch_unique "$BRANCH")

    # Strategy 3: owner-repo-branchpart
    CANDIDATE="${OWNER}-${REPO}-${BRANCH_UNIQUE}"
    if [ ${#CANDIDATE} -le $MAX_LENGTH ]; then
      DOMAIN_NAME="$CANDIDATE"
      STRATEGY="3 (owner-repo-branchpart)"
    else
      # Strategy 4: repo-branchpart
      CANDIDATE="${REPO}-${BRANCH_UNIQUE}"
      if [ ${#CANDIDATE} -le $MAX_LENGTH ]; then
        DOMAIN_NAME="$CANDIDATE"
        STRATEGY="4 (repo-branchpart)"
      else
        # Strategy 5: owner-repo (drop branch completely)
        CANDIDATE="${OWNER}-${REPO}"
        if [ ${#CANDIDATE} -le $MAX_LENGTH ]; then
          DOMAIN_NAME="$CANDIDATE"
          STRATEGY="5 (owner-repo)"
        else
          # Strategy 6: repo only (minimal fallback)
          CANDIDATE="${REPO}"
          if [ ${#CANDIDATE} -le $MAX_LENGTH ]; then
            DOMAIN_NAME="$CANDIDATE"
            STRATEGY="6 (repo only)"
          else
            # Last resort: hash the full name to fit within limit
            HASH=$(echo "${OWNER}-${REPO}-${BRANCH}" | sha256sum | cut -c1-$MAX_LENGTH)
            DOMAIN_NAME="${HASH}"
            STRATEGY="7 (hash)"
          fi
        fi
      fi
    fi
  fi
fi

# Output results
echo "Repository Information:"
echo "  Owner: ${OWNER}"
echo "  Repo: ${REPO}"
echo "  Branch: ${BRANCH}"
echo ""
echo "Domain Strategy: ${STRATEGY}"
echo "Domain Name: ${DOMAIN_NAME} (${#DOMAIN_NAME} chars)"
echo ""
echo "Deployment URL:"
echo "https://${DOMAIN_NAME}.etdofresh.com"
