import { sql } from 'drizzle-orm';
import { db } from '../src/db/drizzle';

// Add/rename columns for new schema:
// - 'name' (synced from Farcaster/Renaissance)
// - 'pfpUrl' (synced from Farcaster/Renaissance) - already exists
// - 'displayName' (app-specific, editable) - rename from customDisplayName or add
// - 'profilePicture' (app-specific, editable) - rename from customPfpUrl or add
async function migrate() {
  try {
    // Add 'name' column if it doesn't exist
    try {
      await db.run(sql`SELECT name FROM users LIMIT 1`);
      console.log('✅ Column name already exists');
    } catch {
      await db.run(sql`ALTER TABLE users ADD COLUMN name TEXT`);
      console.log('✅ Added name column to users table');
    }

    // Add 'profilePicture' column if it doesn't exist
    try {
      await db.run(sql`SELECT profilePicture FROM users LIMIT 1`);
      console.log('✅ Column profilePicture already exists');
    } catch {
      await db.run(sql`ALTER TABLE users ADD COLUMN profilePicture TEXT`);
      console.log('✅ Added profilePicture column to users table');
    }

    // Migrate data from old columns if they exist
    // Copy displayName -> name (if name is null)
    try {
      await db.run(sql`UPDATE users SET name = displayName WHERE name IS NULL AND displayName IS NOT NULL`);
      console.log('✅ Migrated displayName to name');
    } catch (e) {
      console.log('ℹ️ No displayName to migrate or already done');
    }

    // Copy customDisplayName -> displayName (if customDisplayName exists and displayName doesn't match)
    try {
      await db.run(sql`UPDATE users SET displayName = customDisplayName WHERE customDisplayName IS NOT NULL`);
      console.log('✅ Migrated customDisplayName to displayName');
    } catch (e) {
      console.log('ℹ️ No customDisplayName to migrate');
    }

    // Copy customPfpUrl -> profilePicture
    try {
      await db.run(sql`UPDATE users SET profilePicture = customPfpUrl WHERE customPfpUrl IS NOT NULL`);
      console.log('✅ Migrated customPfpUrl to profilePicture');
    } catch (e) {
      console.log('ℹ️ No customPfpUrl to migrate');
    }

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

migrate();
