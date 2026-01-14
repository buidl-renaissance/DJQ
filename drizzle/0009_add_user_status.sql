-- Add status column to users table (nullable, null treated as 'active')
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
