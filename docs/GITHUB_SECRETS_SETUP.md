# GitHub Secrets Setup for Dokploy Deployment

This guide shows how to configure GitHub repository secrets to automatically set environment variables in your Dokploy application during deployment.

## Supported Environment Variables

The GitHub Actions workflow automatically configures these environment variables if they exist as secrets:

- `DATABASE_URL` - PostgreSQL connection string for persistent user storage
- `JWT_SECRET` - Secret key for JWT token generation (optional, auto-generates if not set)
- `NODE_ENV` - Always set to `development` (per CLAUDE.md requirements)

## How to Add GitHub Secrets

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository: `https://github.com/webedt/simple-soup`
2. Click **Settings** (top navigation)
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add DATABASE_URL Secret

1. Click the **New repository secret** button
2. Set the **Name** to: `DATABASE_URL`
3. Set the **Value** to your PostgreSQL connection string:
   ```
   postgresql://username:password@hostname:5432/database_name
   ```

   **Example formats:**

   - Local PostgreSQL:
     ```
     postgresql://postgres:password@localhost:5432/simplesoup
     ```

   - Dokploy PostgreSQL:
     ```
     postgresql://user:password@dokploy-postgres:5432/simplesoup
     ```

   - Cloud provider (e.g., Supabase, Railway, etc.):
     ```
     postgresql://username:password@host.region.provider.com:5432/database
     ```

4. Click **Add secret**

### Step 3: Add JWT_SECRET Secret (Optional)

1. Click **New repository secret** again
2. Set the **Name** to: `JWT_SECRET`
3. Generate a secure random string for the **Value**:

   **Generate using command line:**
   ```bash
   # On Linux/Mac:
   openssl rand -base64 32

   # Or using Node.js:
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   **Example value:**
   ```
   Xt7k9nP2mQ4wR6vY8zA1bC3dE5fG7hJ9
   ```

4. Click **Add secret**

> **Note:** If you don't set `JWT_SECRET`, the application will use a default value. For production deployments, always set a custom JWT_SECRET.

## Verifying Configuration

### Check Workflow Run

After adding secrets, trigger a new deployment:

1. Push a commit to your branch
2. Go to **Actions** tab in GitHub
3. Click on the latest workflow run
4. Expand the **Configure Environment Variables** step
5. You should see:
   ```
   🔧 Configuring environment variables...
     ✅ DATABASE_URL configured
     ✅ JWT_SECRET configured (if set)
     ✅ NODE_ENV=development configured

   📝 Setting 3 environment variable(s)...
   ✅ Environment variables configured successfully
   ```

### Check Dokploy Application

1. Log into your Dokploy dashboard
2. Navigate to your application
3. Click on the **Environment** tab
4. Verify that `DATABASE_URL`, `JWT_SECRET`, and `NODE_ENV` are listed

### Check Application Logs

After deployment, check the application logs in Dokploy. With DATABASE_URL configured, you should see:

```
🚀 Starting backend server...
📡 Port: 3001
✅ Database schema initialized
🔐 ═══════════════════════════════════════════════════════
🔐 DEFAULT ADMIN USER CREATED
🔐 ═══════════════════════════════════════════════════════
🔐 Email:    admin@example.com
🔐 Password: [random password]
🔐 ═══════════════════════════════════════════════════════
💾 Storage mode: PostgreSQL
```

Without DATABASE_URL, you'll see:
```
⚠️  No DATABASE_URL environment variable set
🔐 IN-MEMORY ADMIN USER CREATED
💾 Storage mode: In-Memory (temporary)
```

## PostgreSQL Setup Options

### Option 1: Create PostgreSQL in Dokploy

The easiest way to get a PostgreSQL database for your application:

1. Go to your Dokploy dashboard
2. Navigate to your project (e.g., "Sessions")
3. Click **Add Service** → **PostgreSQL**
4. Configure:
   - **Name**: `simplesoup-db`
   - **Database Name**: `simplesoup`
   - **Username**: `simplesoup_user`
   - **Password**: Generate a secure password
5. Click **Create**
6. Copy the connection string from the service details
7. Add it as `DATABASE_URL` secret in GitHub (format below)

**Connection string format:**
```
postgresql://simplesoup_user:your_password@simplesoup-db:5432/simplesoup
```

> **Note:** When using Dokploy PostgreSQL, the hostname is the service name (e.g., `simplesoup-db`) because they're in the same Docker network.

### Option 2: Use External PostgreSQL Provider

You can use any PostgreSQL provider:

- **Supabase**: Free tier available
- **Railway**: PostgreSQL plugin
- **ElephantSQL**: Managed PostgreSQL
- **AWS RDS**: Production-grade PostgreSQL
- **DigitalOcean**: Managed databases

Simply copy the connection string from your provider and add it as a GitHub secret.

### Option 3: Local Development

For local development without DATABASE_URL:

- The app will use in-memory storage (no persistence)
- A temporary admin user will be created on each restart
- Perfect for testing and quick demos
- No database setup required!

## Security Best Practices

1. ✅ **Never commit secrets** to your repository
2. ✅ **Use strong passwords** for database connections
3. ✅ **Rotate secrets regularly**, especially after team changes
4. ✅ **Use environment-specific secrets** for staging/production
5. ✅ **Limit access** to repository settings
6. ❌ **Don't share secrets** via chat or email
7. ❌ **Don't hardcode secrets** in code or config files

## Updating Secrets

To update an existing secret:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click on the secret name
3. Click **Update secret**
4. Enter the new value
5. Click **Update secret**
6. Trigger a new deployment for changes to take effect

## Removing Environment Variables

To remove an environment variable from Dokploy:

1. Delete the secret from GitHub repository settings
2. Manually update the Dokploy application to remove the variable:
   - Log into Dokploy dashboard
   - Navigate to your application
   - Click **Environment** tab
   - Remove the variable
   - Click **Save**

## Troubleshooting

### Secret not being applied

- Ensure the secret name is exactly `DATABASE_URL` (case-sensitive)
- Check the workflow run logs for configuration errors
- Verify the Dokploy API key has proper permissions

### Database connection errors

- Verify the connection string format is correct
- Check that the database server is accessible from Dokploy
- Ensure database credentials are correct
- For Dokploy PostgreSQL, use the service name as hostname

### Application still using in-memory storage

- Check application logs in Dokploy
- Verify `DATABASE_URL` appears in the Environment tab
- Ensure the application was redeployed after adding the secret
- Check for connection errors in the logs

## Example: Complete Setup

Here's a complete example of setting up DATABASE_URL with Dokploy PostgreSQL:

```bash
# 1. Create PostgreSQL in Dokploy
#    Service Name: simplesoup-db
#    Database: simplesoup
#    User: simplesoup_user
#    Password: MySecurePass123!

# 2. Add GitHub secret
#    Name: DATABASE_URL
#    Value: postgresql://simplesoup_user:MySecurePass123!@simplesoup-db:5432/simplesoup

# 3. Push a commit to trigger deployment
git add .
git commit -m "Configure database"
git push

# 4. Check workflow logs for:
#    ✅ DATABASE_URL configured
#    ✅ Environment variables configured successfully

# 5. Check application logs for:
#    ✅ Database schema initialized
#    🔐 DEFAULT ADMIN USER CREATED
#    💾 Storage mode: PostgreSQL
```

## References

- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Dokploy Environment Variables](https://docs.dokploy.com/docs/core/environment-variables)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
