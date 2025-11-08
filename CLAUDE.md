# Dokploy API Usage Instructions

## Overview

Dokploy provides a comprehensive REST API for managing applications, databases, and deployments programmatically. The API is particularly useful for CI/CD pipelines, automation scripts, and custom integrations.

## Authentication

### Generating an API Token

1. Navigate to your Dokploy instance at `https://your-domain` or `http://your-ip:3000`
2. Go to `/settings/profile`
3. Find the **API/CLI Section**
4. Click to generate a new API token
5. Store the token securely - Dokploy automatically generates a `config.json` with the access token and server URL

### Using the API Token

All API requests require authentication using the `x-api-key` header:

```bash
-H 'x-api-key: YOUR-GENERATED-API-KEY'
```

## Base URL

- **Default**: `http://localhost:3000/api`
- **Production**: Replace with your Dokploy instance IP or domain name
  - Example: `https://your-domain/api`
  - Example: `http://your-vps-ip:3000/api`

## Swagger Documentation

Access interactive API documentation at:
- `http://your-vps-ip:3000/swagger`

**Note**: Swagger UI access is restricted to authenticated administrators only.

## Common API Endpoints

### Project Management

#### Get All Projects

Retrieve all projects and their associated services:

```bash
curl -X 'GET' \
  'https://your-domain/api/project.all' \
  -H 'accept: application/json' \
  -H 'x-api-key: YOUR-API-KEY'
```

**Response**: Returns a list of all projects with their applications and services, including `applicationId` values needed for deployments.

### Application Management

#### Deploy an Application

Trigger a deployment for a specific application:

```bash
curl -X 'POST' \
  'https://your-domain/api/application.deploy' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR-API-KEY' \
  -d '{
  "applicationId": "your-application-id"
}'
```

**Alternative tRPC Endpoint** (recommended for CI/CD):

```bash
curl -X 'POST' \
  'https://your-domain/api/trpc/application.deploy' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR-API-KEY' \
  -d '{
  "json": {
    "applicationId": "your-application-id"
  }
}'
```

#### Start an Application

```bash
curl -X 'POST' \
  'https://your-domain/api/trpc/application.start' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR-API-KEY' \
  -d '{
  "json": {
    "applicationId": "your-application-id"
  }
}'
```

#### Stop an Application

```bash
curl -X 'POST' \
  'https://your-domain/api/trpc/application.stop' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR-API-KEY' \
  -d '{
  "json": {
    "applicationId": "your-application-id"
  }
}'
```

### Docker Compose Management

#### Start a Compose Service

```bash
curl -X 'POST' \
  'https://your-domain/api/trpc/compose.start' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR-API-KEY' \
  -d '{
  "json": {
    "composeId": "your-compose-id"
  }
}'
```

#### Stop a Compose Service

```bash
curl -X 'POST' \
  'https://your-domain/api/trpc/compose.stop' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR-API-KEY' \
  -d '{
  "json": {
    "composeId": "your-compose-id"
  }
}'
```

### Database Management

#### PostgreSQL Operations

**Start PostgreSQL Database:**
```bash
curl -X 'POST' \
  'https://your-domain/api/trpc/postgres.start' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR-API-KEY' \
  -d '{
  "json": {
    "postgresId": "your-postgres-id"
  }
}'
```

**Stop PostgreSQL Database:**
```bash
curl -X 'POST' \
  'https://your-domain/api/trpc/postgres.stop' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR-API-KEY' \
  -d '{
  "json": {
    "postgresId": "your-postgres-id"
  }
}'
```

#### MySQL Operations

**Start MySQL Database:**
```bash
curl -X 'POST' \
  'https://your-domain/api/trpc/mysql.start' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR-API-KEY' \
  -d '{
  "json": {
    "mysqlId": "your-mysql-id"
  }
}'
```

**Stop MySQL Database:**
```bash
curl -X 'POST' \
  'https://your-domain/api/trpc/mysql.stop' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR-API-KEY' \
  -d '{
  "json": {
    "mysqlId": "your-mysql-id"
  }
}'
```

#### Redis Operations

**Start Redis:**
```bash
curl -X 'POST' \
  'https://your-domain/api/trpc/redis.start' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR-API-KEY' \
  -d '{
  "json": {
    "redisId": "your-redis-id"
  }
}'
```

**Stop Redis:**
```bash
curl -X 'POST' \
  'https://your-domain/api/trpc/redis.stop' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR-API-KEY' \
  -d '{
  "json": {
    "redisId": "your-redis-id"
  }
}'
```

#### MongoDB Operations

Similar patterns apply for MongoDB with endpoints:
- `/api/trpc/mongo.start`
- `/api/trpc/mongo.stop`

#### MariaDB Operations

Similar patterns apply for MariaDB with endpoints:
- `/api/trpc/mariadb.start`
- `/api/trpc/mariadb.stop`

## Available API Endpoint Categories

The Dokploy API provides endpoints for the following categories:

- **Admin** - Administrative operations
- **Application** - Application lifecycle management
- **Auth** - Authentication and authorization
- **Backup** - Backup management
- **Bitbucket** - Bitbucket integration
- **Certificates** - SSL/TLS certificate management
- **Cluster** - Cluster operations
- **Compose** - Docker Compose management
- **Deployment** - Deployment operations
- **Destination** - Deployment destinations
- **Docker** - Docker operations
- **Domain** - Domain management
- **Github** - GitHub integration
- **Gitlab** - GitLab integration
- **Git Provider** - Generic Git provider operations
- **Mariadb** - MariaDB database management
- **Mongo** - MongoDB database management
- **Mounts** - Volume and mount management
- **Mysql** - MySQL database management
- **Notification** - Notification settings
- **Port** - Port configuration
- **Postgres** - PostgreSQL database management
- **Project** - Project management
- **Redirects** - URL redirect management
- **Redis** - Redis database management
- **Registry** - Container registry management
- **Security** - Security settings
- **Server** - Server management
- **Settings** - General settings
- **Ssh Key** - SSH key management
- **Stripe** - Payment integration
- **User** - User management

## CI/CD Integration Examples

### GitHub Actions Example

```yaml
name: Deploy to Dokploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Dokploy Deployment
        run: |
          curl -X 'POST' \
            'https://your-domain/api/trpc/application.deploy' \
            -H 'accept: application/json' \
            -H 'Content-Type: application/json' \
            -H 'x-api-key: ${{ secrets.DOKPLOY_API_KEY }}' \
            -d '{
              "json": {
                "applicationId": "${{ secrets.DOKPLOY_APP_ID }}"
              }
            }'
```

### GitLab CI Example

```yaml
deploy:
  stage: deploy
  script:
    - |
      curl -X 'POST' \
        'https://your-domain/api/trpc/application.deploy' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        -H 'x-api-key: ${DOKPLOY_API_KEY}' \
        -d '{
          "json": {
            "applicationId": "${DOKPLOY_APP_ID}"
          }
        }'
  only:
    - main
```

## Best Practices

1. **Secure Your API Keys**: Never commit API keys to version control. Use environment variables or secrets management.

2. **Use HTTPS**: Always use HTTPS in production to encrypt API communications.

3. **Error Handling**: Implement proper error handling in your scripts to handle API failures gracefully.

4. **Rate Limiting**: Be mindful of rate limits when making bulk API requests.

5. **Get IDs First**: Before performing operations, use `project.all` to retrieve the correct IDs for applications, databases, and other resources.

6. **Use tRPC Endpoints**: For CI/CD pipelines, prefer the `/api/trpc/*` endpoints as they follow a consistent pattern.

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check that your API key is valid and included in the `x-api-key` header.

2. **404 Not Found**: Verify the application/service ID exists using the `project.all` endpoint.

3. **503 Service Unavailable**: The Dokploy server may be temporarily unavailable or restarting.

4. **Invalid Application ID**: Use `project.all` to confirm the correct ID format and value.

## Example Workflow

1. **Generate API Token**: Create a token in Dokploy settings
2. **List Projects**: Call `project.all` to get all project and service IDs
3. **Identify Target**: Find the `applicationId` for the service you want to manage
4. **Execute Operation**: Call the appropriate endpoint (deploy, start, stop, etc.)
5. **Monitor Results**: Check response status and logs

## Additional Resources

- Official Dokploy API Documentation: https://docs.dokploy.com/docs/api
- Application Reference: https://docs.dokploy.com/docs/api/reference-application
- Auto Deploy Guide: https://docs.dokploy.com/docs/core/auto-deploy
- Swagger UI: `http://your-instance:3000/swagger`

## Test Scripts

Two test scripts are included in this repository to help you get started with the Dokploy API:

### Bash Test Script

`test-dokploy-api.sh` - A simple bash script that demonstrates basic API calls:

```bash
./test-dokploy-api.sh
```

This script will:
- Test the `project.all` endpoint to list all projects
- Show examples of deploy, start, and stop operations
- Display database operation endpoints

### Python Test Script

`test-dokploy-api.py` - A more comprehensive Python script with better error handling:

```bash
python3 test-dokploy-api.py
```

Features:
- Makes actual API requests using the `requests` library
- Provides detailed response information
- Shows example usage for all major endpoint types
- Falls back to example mode if `requests` is not installed

Both scripts automatically use the `DOKPLOY_URL` and `DOKPLOY_API` environment variables if available.

## Test Results

Successfully tested with environment variables:
- **DOKPLOY_URL**: `https://dokploy.etdofresh.com/`
- **DOKPLOY_API**: API key from environment

### Successful API Calls

✅ **GET /api/project.all** - Successfully retrieved all projects
- Returns complete project structure including applications, databases, and compose services
- Response includes project IDs, environment IDs, application IDs, and all configuration details

Example response structure:
```json
[
  {
    "projectId": "l4UTuhy2g13e-g_X7Pz5g",
    "name": "Tools",
    "environments": [
      {
        "environmentId": "BFHBS_W-a2D1WaSKpTgAN",
        "name": "production",
        "applications": [...],
        "compose": [...],
        "postgres": [...],
        "mysql": [...],
        "redis": [...]
      }
    ]
  }
]
```

---

*Last Updated: 2025-11-08*
