-- PostgreSQL initialization script
-- Run once on first DB creation

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy text search

-- Create application roles
-- The app uses the 'saas' user (created by docker-compose env vars)
-- Super admin uses the same user but with a flag in JWT

-- RLS Note: 
-- RLS policies are created by Prisma migrations.
-- The app sets: SET LOCAL app.current_tenant = '{uuid}' before each query.
-- This allows PostgreSQL RLS to filter rows automatically.

-- Grant the app user necessary permissions
-- (Already done as the DB owner in dev; configure separately in production)

SELECT 'Database initialized' AS status;
