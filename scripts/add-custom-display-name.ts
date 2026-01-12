import { sql } from 'drizzle-orm';
import { db } from '../src/db/drizzle';

// Add customDisplayName column to users table
async function migrate() {
  try {
    // Check if column already exists by trying to select it
    try {
      await db.run(sql`SELECT customDisplayName FROM users LIMIT 1`);
      console.log('✅ Column customDisplayName already exists');
    } catch {
      // Column doesn't exist, add it
      await db.run(sql`ALTER TABLE users ADD COLUMN customDisplayName TEXT`);
      console.log('✅ Added customDisplayName column to users table');
    }
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

migrate();
