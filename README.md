# Hello World - Vite + TypeScript

A simple Hello World application built with Vite and TypeScript.

## Features

- ⚡️ Vite for fast development and building
- 🔷 TypeScript for type safety
- 🎨 Modern CSS styling with dark/light theme support
- 🔢 Interactive counter button

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build the project for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
.
├── public/          # Static assets
│   └── vite.svg
├── src/             # Source files
│   ├── main.ts      # Application entry point
│   └── style.css    # Global styles
├── index.html       # HTML template
├── package.json     # Project dependencies and scripts
└── tsconfig.json    # TypeScript configuration
```

## Deployment

This project is configured for automated deployment to Dokploy using GitHub Actions.

### Automated Deployment

The workflow automatically deploys to Dokploy when code is pushed to any branch. Each deployment:

- Creates a unique application: `{owner}-{repo}-{branch}-{short-sha}`
- Gets its own domain: `https://{owner}-{repo}-{branch}-{short-sha}.etdofresh.com`
- Runs on port 3000

**Example:**
- Application: `webedt-supreme-spoon-main-abc1234`
- URL: `https://webedt-supreme-spoon-main-abc1234.etdofresh.com`

### Setup Deployment

1. **Get Dokploy IDs:**
   ```bash
   .github/get-dokploy-ids.sh
   ```

2. **Configure GitHub Variables and Secrets:**
   Go to `Settings > Secrets and variables > Actions`

   **Variables tab:**
   - `DOKPLOY_URL` - Your Dokploy instance URL
   - `DOKPLOY_PROJECT_ID` - ID of the "Sessions" project
   - `DOKPLOY_ENVIRONMENT_ID` - ID of the target environment
   - `DOKPLOY_GITHUB_APP_ID` - ID of your Dokploy GitHub App

   **Secrets tab:**
   - `DOKPLOY_API_KEY` - Your Dokploy API key

   **Note**: Applications are created automatically - no need to pre-create them!

3. **Push to deploy:**
   ```bash
   git push origin main
   ```

For detailed deployment instructions, see [.github/DEPLOYMENT.md](.github/DEPLOYMENT.md)

## Technologies

- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Dokploy](https://dokploy.com/) - Deployment platform
- [GitHub Actions](https://github.com/features/actions) - CI/CD automation
