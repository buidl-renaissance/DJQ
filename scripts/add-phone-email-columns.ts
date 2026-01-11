import { createClient } from '@libsql/client';
import 'dotenv/config';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_DATABASE_AUTH_TOKEN
});

async function migrate() {
  // Check current columns
  const info = await client.execute('PRAGMA table_info(users)');
  console.log('Current columns:', info.rows.map(r => ({ name: r.name, notnull: r.notnull })));
  
  const columns = info.rows.map(r => r.name);
  
  // Add phone column if not exists
  if (!columns.includes('phone')) {
    await client.execute('ALTER TABLE users ADD COLUMN phone TEXT');
    console.log('Added phone column');
    // Create unique index for phone
    await client.execute('CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique ON users(phone)');
    console.log('Created unique index for phone');
  } else {
    console.log('phone column already exists');
  }
  
  // Add email column if not exists
  if (!columns.includes('email')) {
    await client.execute('ALTER TABLE users ADD COLUMN email TEXT');
    console.log('Added email column');
  } else {
    console.log('email column already exists');
  }
  
  // SQLite doesn't allow dropping NOT NULL constraint directly
  // We need to recreate the table to make fid nullable
  // Check if fid is still NOT NULL
  const fidCol = info.rows.find(r => r.name === 'fid');
  if (fidCol && fidCol.notnull === 1) {
    console.log('fid is NOT NULL, recreating table to allow NULL...');
    
    // Drop leftover table if exists from previous failed attempt
    await client.execute('DROP TABLE IF EXISTS users_new');
    
    // Disable foreign keys
    await client.execute('PRAGMA foreign_keys = OFF');
    
    // Create new table with nullable fid
    await client.execute(`
      CREATE TABLE users_new (
        id TEXT PRIMARY KEY NOT NULL,
        fid TEXT,
        phone TEXT,
        email TEXT,
        username TEXT,
        displayName TEXT,
        pfpUrl TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `);
    console.log('Created users_new table');
    
    // Copy data
    await client.execute(`
      INSERT INTO users_new (id, fid, phone, email, username, displayName, pfpUrl, createdAt, updatedAt)
      SELECT id, fid, phone, email, username, displayName, pfpUrl, createdAt, updatedAt
      FROM users
    `);
    console.log('Copied data to users_new');
    
    // Drop old table
    await client.execute('DROP TABLE users');
    console.log('Dropped old users table');
    
    // Rename new table
    await client.execute('ALTER TABLE users_new RENAME TO users');
    console.log('Renamed users_new to users');
    
    // Recreate unique indexes
    await client.execute('CREATE UNIQUE INDEX users_fid_unique ON users(fid)');
    await client.execute('CREATE UNIQUE INDEX users_phone_unique ON users(phone)');
    console.log('Recreated indexes');
    
    // Re-enable foreign keys
    await client.execute('PRAGMA foreign_keys = ON');
    
    console.log('Successfully made fid nullable');
  } else {
    console.log('fid is already nullable');
  }
  
  // Verify
  const info2 = await client.execute('PRAGMA table_info(users)');
  console.log('Updated columns:', info2.rows.map(r => ({ name: r.name, notnull: r.notnull })));
}

migrate().catch(console.error);
