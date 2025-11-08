# Dokploy Deployment Setup

This document explains how to set up automated deployments to Dokploy using GitHub Actions.

## Overview

The GitHub Actions workflow automatically deploys this TypeScript application to Dokploy whenever code is pushed to specific branches. Each deployment is named using the pattern:

```
{owner}-{repo}-{branch}-{short-sha}
```

For example: `webedt-supreme-spoon-main-abc1234`

## Prerequisites

1. A Dokploy instance with API access
2. A Dokploy project (e.g., "Sessions") where applications will be deployed
3. An application created in Dokploy for deployment

## Required Configuration

You need to configure both **GitHub Variables** (for non-sensitive data) and **GitHub Secrets** (for sensitive data).

Navigate to: `Settings > Secrets and variables > Actions`

### GitHub Variables

Click on the **Variables** tab and add these repository variables:

#### `DOKPLOY_URL`
The base URL of your Dokploy instance.

**Example values:**
- `https://dokploy.yourdomain.com`
- `http://your-vps-ip:3000`

**Important:** Include the protocol (`https://` or `http://`).

#### `DOKPLOY_PROJECT_ID`
The ID of the Dokploy project where applications will be deployed (e.g., "Sessions" project).

**How to find:**
```bash
curl -X 'GET' \
  'https://your-dokploy-instance/api/project.all' \
  -H 'accept: application/json' \
  -H 'x-api-key: YOUR-API-KEY'
```

Look for the `projectId` field in the response for your "Sessions" project.

#### `DOKPLOY_ENVIRONMENT_ID`
The ID of the environment within the project (e.g., "production" environment).

**How to find:**
Using the same `project.all` API call as above, look within your project for the `environments` array. Find your target environment (e.g., "production") and copy the `environmentId` value.

**Example response structure:**
```json
{
  "projectId": "l4UTuhy2g13e-g_X7Pz5g",
  "name": "Sessions",
  "environments": [
    {
      "environmentId": "BFHBS_W-a2D1WaSKpTgAN",
      "name": "production"
    }
  ]
}
```

#### `DOKPLOY_GITHUB_APP_ID`
The ID of your Dokploy GitHub App integration.

**How to find:**
1. Log into your Dokploy instance
2. Navigate to Settings > GitHub
3. Find your GitHub App connection
4. Copy the GitHub App ID

This is required for Dokploy to access your GitHub repositories via the GitHub App.

### GitHub Secrets

Click on the **Secrets** tab and add this repository secret:

#### `DOKPLOY_API_KEY`
Your Dokploy API key for authentication.

**How to generate:**
1. Navigate to your Dokploy instance
2. Go to `/settings/profile`
3. Find the **API/CLI Section**
4. Click to generate a new API token
5. Copy the generated token

**Note**: The workflow will automatically create applications in Dokploy as needed. You don't need to manually create applications or provide application IDs.

## How It Works

The workflow automatically:

1. **Generates a unique application name** based on: `{owner}-{repo}-{branch}-{short-sha}`
2. **Checks if the application exists** in your Dokploy project
3. **Creates the application** if it doesn't exist, with:
   - GitHub repository integration
   - Branch tracking
   - Nixpacks build system
   - Port 3000
4. **Adds a domain** to the application: `https://{owner}-{repo}-{branch}-{short-sha}.etdofresh.com`
5. **Deploys the application** to Dokploy

Each branch and commit gets its own isolated deployment with a unique URL.

## Workflow Triggers

The workflow runs on:

- **Push events** to any branch
- **Pull requests** to any branch
- **Manual trigger** via workflow dispatch

## Customization

### Limit to Specific Branches

If you want to restrict deployments to specific branches, edit `.github/workflows/deploy-dokploy.yml`:

```yaml
on:
  push:
    branches:
      - main           # Only deploy from these branches
      - staging
      - production
  pull_request:
    branches:
      - main
```

### Change Node.js Version

Update the `NODE_VERSION` environment variable:

```yaml
env:
  NODE_VERSION: '20'  # Change to your preferred version
```

### Customize Domain

To use a different domain suffix, edit the workflow file and modify the domain assignment:

```yaml
DOMAIN="${APP_NAME}.yourdomain.com"  # Change etdofresh.com to your domain
```

### Change Default Port

To use a different port, update both the application creation and domain configuration:

```yaml
"port": 8080  # Change from 3000 to your desired port
```

### Add Build Artifacts

To upload build artifacts for debugging:

```yaml
- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: dist-${{ steps.metadata.outputs.short_sha }}
    path: dist/
    retention-days: 7
```

## Application Naming Convention

The workflow generates a unique application name for each deployment:

| Component | Source | Example |
|-----------|--------|---------|
| Owner | Repository owner (lowercase, sanitized) | `webedt` |
| Repo | Repository name (lowercase) | `supreme-spoon` |
| Branch | Git branch (lowercase, `/` replaced with `-`) | `main` or `feature-new-ui` |
| Short SHA | First 7 characters of commit hash | `abc1234` |

**Example Application Name:** `webedt-supreme-spoon-feature-new-ui-abc1234`

**Example Domain:** `https://webedt-supreme-spoon-feature-new-ui-abc1234.etdofresh.com`

## Deployment Process

1. **Checkout**: Code is checked out from the repository
2. **Setup**: Node.js and dependencies are installed
3. **Build**: Project is built using `npm run build`
4. **Metadata**: Unique deployment name is generated
5. **Application Discovery**: Checks if application already exists in Dokploy
6. **Application Creation** (if needed): Creates new application with:
   - GitHub repository integration
   - Branch tracking
   - Port 3000 configuration
   - Nixpacks build system
7. **Domain Configuration** (if new): Adds domain `https://{app-name}.etdofresh.com`
8. **Deploy**: Triggers Dokploy deployment via API
9. **Summary**: Displays deployment results with application URL

## Monitoring Deployments

### GitHub Actions UI

View deployment status in the Actions tab of your repository:
- `https://github.com/{owner}/{repo}/actions`

### Dokploy Dashboard

Monitor deployments in your Dokploy instance:
- Navigate to your project
- Check the application's deployment history
- View logs and status

### API Monitoring

Check deployment status via API:

```bash
curl -X 'GET' \
  'https://your-dokploy-instance/api/project.all' \
  -H 'accept: application/json' \
  -H 'x-api-key: YOUR-API-KEY'
```

## Troubleshooting

### Authentication Errors (401)

**Cause:** Invalid or expired API key

**Solution:**
1. Regenerate API key in Dokploy
2. Update `DOKPLOY_API_KEY` secret in GitHub

### Application Not Found (404)

**Cause:** Invalid `DOKPLOY_APPLICATION_ID`

**Solution:**
1. Run `project.all` API call to list all applications
2. Verify the application ID exists
3. Update the `DOKPLOY_APPLICATION_ID` secret

### Deployment Fails

**Check:**
1. Application exists in Dokploy
2. Application is properly configured
3. Repository and branch settings in Dokploy match your GitHub repo
4. Build completes successfully (check GitHub Actions logs)

### Build Failures

**Common causes:**
- Missing dependencies
- TypeScript compilation errors
- Node version mismatch

**Solution:**
1. Run `npm run build` locally to identify issues
2. Ensure `NODE_VERSION` in workflow matches your project requirements
3. Check GitHub Actions logs for specific error messages

## Advanced Configuration

### Multiple Environments

Deploy to different Dokploy applications based on branch:

```yaml
- name: Determine Environment
  id: env
  run: |
    if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
      echo "app_id=${{ secrets.DOKPLOY_PROD_APP_ID }}" >> $GITHUB_OUTPUT
    elif [[ "${{ github.ref }}" == "refs/heads/develop" ]]; then
      echo "app_id=${{ secrets.DOKPLOY_DEV_APP_ID }}" >> $GITHUB_OUTPUT
    else
      echo "app_id=${{ secrets.DOKPLOY_PREVIEW_APP_ID }}" >> $GITHUB_OUTPUT
    fi
```

### Deployment Notifications

Add Slack or Discord notifications:

```yaml
- name: Notify Deployment
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment of ${{ steps.metadata.outputs.app_name }} ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Health Checks

Add post-deployment health check:

```yaml
- name: Health Check
  run: |
    sleep 10  # Wait for deployment
    curl -f https://your-app-url/health || exit 1
```

## Security Best Practices

1. **Never commit API keys** to the repository
2. **Use GitHub Secrets** for all sensitive information
3. **Enable HTTPS** for your Dokploy instance in production
4. **Rotate API keys** regularly
5. **Limit API key permissions** to only what's needed
6. **Use environment-specific secrets** for production vs. development

## Testing the Workflow

### Local Testing

Test the build process locally before pushing:

```bash
npm ci
npm run build
```

### Manual Trigger

Test the workflow without pushing code:

1. Go to Actions tab in GitHub
2. Select "Deploy to Dokploy" workflow
3. Click "Run workflow"
4. Choose branch and click "Run workflow"

## Additional Resources

- [Dokploy API Documentation](https://docs.dokploy.com/docs/api)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## Support

For issues related to:
- **Dokploy API**: Consult the [Dokploy documentation](https://docs.dokploy.com)
- **GitHub Actions**: Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
- **This workflow**: Open an issue in this repository
