# Setting Dokploy Environment Variables via GitHub Actions

This guide shows how to configure environment variables for your Dokploy application using GitHub Secrets and the Dokploy API.

## Overview

You can automatically set environment variables in your Dokploy application during deployment by:
1. Storing secrets in GitHub repository secrets
2. Using the Dokploy API in your GitHub Actions workflow to update the application environment

## Step 1: Add GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `DOKPLOY_API_KEY` - Your Dokploy API key
- `DOKPLOY_URL` - Your Dokploy instance URL (e.g., `https://dokploy.etdofresh.com`)
- `DOKPLOY_APP_ID` - Your application ID in Dokploy
- `DATABASE_URL` - Your PostgreSQL connection string (if using database)

## Step 2: Update GitHub Actions Workflow

Add a step to set environment variables before deployment:

```yaml
name: Deploy to Dokploy

on:
  push:
    branches:
      - main
      - 'claude/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set Environment Variables in Dokploy
        run: |
          # Set DATABASE_URL if available
          if [ -n "${{ secrets.DATABASE_URL }}" ]; then
            curl -X 'POST' \
              '${{ secrets.DOKPLOY_URL }}/api/trpc/application.update' \
              -H 'accept: application/json' \
              -H 'Content-Type: application/json' \
              -H 'x-api-key: ${{ secrets.DOKPLOY_API_KEY }}' \
              -d '{
                "json": {
                  "applicationId": "${{ secrets.DOKPLOY_APP_ID }}",
                  "env": "DATABASE_URL=${{ secrets.DATABASE_URL }}\nNODE_ENV=development"
                }
              }'
            echo "✅ Environment variables set in Dokploy"
          else
            echo "⚠️  DATABASE_URL not set, skipping environment variable update"
          fi

      - name: Trigger Dokploy Deployment
        run: |
          curl -X 'POST' \
            '${{ secrets.DOKPLOY_URL }}/api/trpc/application.deploy' \
            -H 'accept: application/json' \
            -H 'Content-Type: application/json' \
            -H 'x-api-key: ${{ secrets.DOKPLOY_API_KEY }}' \
            -d '{
              "json": {
                "applicationId": "${{ secrets.DOKPLOY_APP_ID }}"
              }
            }'
          echo "✅ Deployment triggered"
```

## Step 3: Get Your Application ID

To find your application ID in Dokploy:

### Method 1: Using the Dokploy API

```bash
curl -X 'GET' \
  'https://dokploy.etdofresh.com/api/project.all' \
  -H 'accept: application/json' \
  -H 'x-api-key: YOUR-API-KEY' | jq '.[] | .environments[].applications[] | {name, applicationId}'
```

### Method 2: Dokploy Dashboard

1. Go to your Dokploy dashboard
2. Navigate to your project
3. Click on your application
4. The application ID is in the URL: `/dashboard/project/[projectId]/services/application/[applicationId]`

## Step 4: Configure Multiple Environment Variables

To set multiple environment variables, format them as newline-separated:

```bash
curl -X 'POST' \
  'https://dokploy.etdofresh.com/api/trpc/application.update' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR-API-KEY' \
  -d '{
    "json": {
      "applicationId": "your-app-id",
      "env": "DATABASE_URL=postgresql://user:pass@host:5432/db\nNODE_ENV=production\nJWT_SECRET=your-secret-key\nPORT=3001"
    }
  }'
```

## Example: Complete Workflow with Environment Variables

```yaml
name: Deploy with Environment Variables

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Configure Dokploy Application
        env:
          DOKPLOY_URL: ${{ secrets.DOKPLOY_URL }}
          DOKPLOY_API_KEY: ${{ secrets.DOKPLOY_API_KEY }}
          DOKPLOY_APP_ID: ${{ secrets.DOKPLOY_APP_ID }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
        run: |
          # Build environment variable string
          ENV_VARS="DATABASE_URL=${DATABASE_URL}\nNODE_ENV=production"

          if [ -n "${JWT_SECRET}" ]; then
            ENV_VARS="${ENV_VARS}\nJWT_SECRET=${JWT_SECRET}"
          fi

          # Update application environment
          curl -X 'POST' \
            "${DOKPLOY_URL}/api/trpc/application.update" \
            -H 'accept: application/json' \
            -H 'Content-Type: application/json' \
            -H "x-api-key: ${DOKPLOY_API_KEY}" \
            -d "{
              \"json\": {
                \"applicationId\": \"${DOKPLOY_APP_ID}\",
                \"env\": \"${ENV_VARS}\"
              }
            }"

      - name: Deploy Application
        env:
          DOKPLOY_URL: ${{ secrets.DOKPLOY_URL }}
          DOKPLOY_API_KEY: ${{ secrets.DOKPLOY_API_KEY }}
          DOKPLOY_APP_ID: ${{ secrets.DOKPLOY_APP_ID }}
        run: |
          curl -X 'POST' \
            "${DOKPLOY_URL}/api/trpc/application.deploy" \
            -H 'accept: application/json' \
            -H 'Content-Type: application/json' \
            -H "x-api-key: ${DOKPLOY_API_KEY}" \
            -d "{
              \"json\": {
                \"applicationId\": \"${DOKPLOY_APP_ID}\"
              }
            }"

          echo "✅ Deployment completed"
```

## Security Best Practices

1. **Never commit secrets** to your repository
2. **Use GitHub Secrets** for all sensitive data
3. **Rotate API keys** regularly
4. **Use environment-specific secrets** for different deployment targets
5. **Limit API key permissions** if possible

## Viewing Environment Variables in Dokploy

After setting environment variables via the API, you can verify them in the Dokploy dashboard:

1. Go to your application in Dokploy
2. Click on the "Environment" tab
3. View all configured environment variables

## Troubleshooting

### Environment variables not appearing

- Verify your `DOKPLOY_APP_ID` is correct
- Check that the API key has proper permissions
- Ensure the environment variable format is correct (newline-separated)

### Deployment fails after setting environment variables

- The application may need to be rebuilt to pick up new environment variables
- Some variables may require a container restart
- Check the application logs in Dokploy for specific errors

## References

- [Dokploy API Documentation](https://docs.dokploy.com/docs/api)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
