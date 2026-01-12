-- Add PIN security columns to users table
ALTER TABLE users ADD COLUMN pinHash TEXT;
ALTER TABLE users ADD COLUMN failedPinAttempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN lockedAt INTEGER;
