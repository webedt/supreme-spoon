# GitHub Actions Setup for Dokploy Deployment

This guide explains how to configure GitHub Actions to automatically deploy your application to Dokploy.

## Required GitHub Variables and Secrets

You need to configure the following in your GitHub repository settings:

### Secrets (Settings → Secrets and variables → Actions → Secrets)

- **`DOKPLOY_API_KEY`**: Your Dokploy API key
  - Generate this in Dokploy at: `/settings/profile` → API/CLI Section

### Variables (Settings → Secrets and variables → Actions → Variables)

- **`DOKPLOY_URL`**: Your Dokploy instance URL (e.g., `https://dokploy.etdofresh.com`)
- **`DOKPLOY_PROJECT_ID`**: The ID of your Dokploy project
- **`DOKPLOY_ENVIRONMENT_ID`**: The ID of your environment (e.g., production)
- **`DOKPLOY_GITHUB_ID`**: The GitHub provider ID in Dokploy (see below)

## How to Get Your DOKPLOY_GITHUB_ID

The `DOKPLOY_GITHUB_ID` is Dokploy's internal identifier (UUID) for your GitHub integration, **not** the GitHub App ID.

### Method 1: Using the Dokploy API

1. Make sure you have your `DOKPLOY_API_KEY`

2. Run this curl command to list all GitHub providers:

```bash
curl -X 'GET' \
  'https://your-dokploy-url/api/trpc/github.githubProviders' \
  -H 'accept: application/json' \
  -H 'x-api-key: YOUR-API-KEY'
```

3. Look for your GitHub provider in the response. The `githubId` field is what you need.

Example response:
```json
{
  "result": {
    "data": {
      "json": [
        {
          "githubId": "abc123-def456-ghi789",  // ← This is your DOKPLOY_GITHUB_ID
          "name": "My GitHub Integration",
          "githubAppName": "Dokploy-2025-11-07-c9qppf"
        }
      ]
    }
  }
}
```

### Method 2: Using Dokploy UI (if available)

1. Log into your Dokploy instance
2. Navigate to Settings → Git Providers → GitHub
3. The provider ID should be visible in the URL or provider details

### Method 3: Check Project Applications

You can also get the githubId by checking existing applications:

```bash
curl -X 'GET' \
  'https://your-dokploy-url/api/project.all' \
  -H 'accept: application/json' \
  -H 'x-api-key: YOUR-API-KEY'
```

Look for applications that use GitHub and check their `githubId` field.

## How the Workflow Works

The GitHub Actions workflow (`.github/workflows/deploy-dokploy.yml`) does the following:

1. **Build**: Checks out code, installs dependencies, and builds the project
2. **Create/Find Application**:
   - Checks if an application already exists for this branch/commit
   - If not, creates a new application in Dokploy
3. **Configure GitHub**: Links the application to your GitHub repository using `application.saveGithubProvider`
4. **Deploy**: Triggers a deployment in Dokploy
5. **Add Domain**: Configures the domain for the application

## Important Notes

### githubId vs githubAppId

- **`githubId`** (string/UUID): Dokploy's internal identifier for a GitHub provider configuration
  - Example: `"abc123-def456-ghi789"`
  - Used in API calls to link applications to GitHub

- **`githubAppId`** (number): The actual GitHub App ID from GitHub's platform
  - Example: `12345678`
  - Used when configuring the GitHub App itself in Dokploy

### Troubleshooting

**Error: "Failed to configure GitHub provider"**
- Make sure `DOKPLOY_GITHUB_ID` is set to the correct UUID value
- Verify the GitHub provider exists in your Dokploy instance
- Check that the API key has the necessary permissions

**Error: "Branch Not Match"**
- Ensure the branch in the workflow matches the branch you're pushing to
- The workflow uses `github.ref_name` which gets the current branch

**Error: "No mutation-procedure on path"**
- This means the API endpoint doesn't exist or the format is wrong
- Make sure you're using the latest Dokploy version that supports tRPC endpoints

## Testing Your Setup

1. Set all required secrets and variables in GitHub
2. Get your `DOKPLOY_GITHUB_ID` using one of the methods above
3. Push to your repository
4. Check the Actions tab in GitHub to see the workflow run
5. Monitor the deployment in your Dokploy dashboard

## API Endpoints Used

- `GET /api/project.all` - List all projects and applications
- `POST /api/trpc/application.create` - Create a new application
- `POST /api/trpc/application.saveGithubProvider` - Configure GitHub for an application
- `POST /api/trpc/application.deploy` - Trigger deployment

## Further Reading

- [Dokploy API Documentation](https://docs.dokploy.com/docs/api)
- [Dokploy Auto Deploy Guide](https://docs.dokploy.com/docs/core/auto-deploy)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
