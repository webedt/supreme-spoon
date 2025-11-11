#!/bin/bash

# Script to reset admin password by deleting and recreating the admin user

echo "🔐 Admin Password Reset Tool"
echo "============================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo ""
  echo "Usage:"
  echo "  DATABASE_URL='your-connection-string' ./scripts/reset-admin.sh"
  exit 1
fi

echo "📍 Database: ${DATABASE_URL%%@*}@[HIDDEN]"
echo ""

# Delete all admin users
echo "🗑️  Deleting existing admin users..."
psql "$DATABASE_URL" -c "DELETE FROM users WHERE role = 'admin';" 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Admin users deleted"
  echo ""
  echo "🔄 Restart your application to create a new admin user"
  echo "   The new password will appear in the startup logs"
else
  echo "❌ Failed to delete admin users"
  echo ""
  echo "Make sure:"
  echo "  1. DATABASE_URL is correct"
  echo "  2. Database is accessible"
  echo "  3. 'users' table exists"
fi
