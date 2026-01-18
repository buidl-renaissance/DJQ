-- Add publishedEventId for cross-app publishing to renaissance-events
ALTER TABLE events ADD COLUMN publishedEventId INTEGER;
