#!/bin/bash

# Database migration script for scores table
# This script will update the existing scores table with missing columns

echo "Starting database migration for scores table..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found. Please install PostgreSQL client tools."
    exit 1
fi

# Check if environment variables are set
if [ -z "$DATABASE_URL" ] && [ -z "$PGHOST" ]; then
    echo "Warning: Database connection variables not set."
    echo "Please set DATABASE_URL or individual connection variables (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD)"
    echo ""
    echo "Example:"
    echo "export DATABASE_URL='postgresql://username:password@localhost:5432/database_name'"
    echo "or"
    echo "export PGHOST=localhost"
    echo "export PGPORT=5432"
    echo "export PGDATABASE=your_database"
    echo "export PGUSER=your_username"
    echo "export PGPASSWORD=your_password"
    echo ""
    read -p "Do you want to continue with manual connection? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run the migration
echo "Running migration script..."
if [ -n "$DATABASE_URL" ]; then
    psql "$DATABASE_URL" -f db/update_scores_schema.sql
else
    psql -f db/update_scores_schema.sql
fi

if [ $? -eq 0 ]; then
    echo "Migration completed successfully!"
    echo "The scores table now has all required columns for the game result API."
else
    echo "Migration failed. Please check the error messages above."
    exit 1
fi

echo ""
echo "Next steps:"
echo "1. Restart your server to pick up the route changes"
echo "2. Test the API endpoint: GET /api/scores/result?sessionId=test&playerId=test"
echo "3. Check the server logs for any errors"
