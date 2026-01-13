import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from './drizzle';
import { users, farcasterAccounts } from './schema';

const BCRYPT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 3;

export interface User {
  id: string;
  fid?: string | null; // Optional - only for Farcaster users
  phone?: string | null; // For direct registration/login
  email?: string | null; // Optional
  username?: string | null;
  name?: string | null; // Synced from Farcaster/Renaissance
  pfpUrl?: string | null; // Synced from Farcaster/Renaissance
  displayName?: string | null; // App-specific name (editable)
  profilePicture?: string | null; // App-specific profile picture (editable)
  accountAddress?: string | null; // Wallet address from Renaissance auth
  pinHash?: string | null; // bcrypt hash of 4-digit PIN
  failedPinAttempts: number; // Failed PIN attempts counter (defaults to 0)
  lockedAt?: Date | null; // Timestamp when account was locked
  hasPin?: boolean; // Convenience field (derived from pinHash)
  createdAt: Date;
  updatedAt: Date;
}

// Helper to get failedPinAttempts, treating null as 0
function getFailedAttempts(value: number | null | undefined): number {
  return value ?? 0;
}

export interface FarcasterAccount {
  id: string;
  userId: string;
  fid: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FarcasterUserData {
  fid: string;
  username?: string;
  name?: string; // Will be stored in 'name' field (synced)
  pfpUrl?: string; // Will be stored in 'pfpUrl' field (synced)
  accountAddress?: string; // Wallet address from Renaissance auth
}

export async function getUserByFid(fid: string): Promise<User | null> {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.fid, fid))
    .limit(1);
  
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    fid: row.fid,
    phone: row.phone,
    email: row.email,
    username: row.username,
    name: row.name,
    pfpUrl: row.pfpUrl,
    displayName: row.displayName,
    profilePicture: row.profilePicture,
    accountAddress: row.accountAddress,
    pinHash: row.pinHash,
    failedPinAttempts: getFailedAttempts(row.failedPinAttempts),
    lockedAt: row.lockedAt || null,
    createdAt: row.createdAt || new Date(),
    updatedAt: row.updatedAt || new Date(),
  } as User;
}

export async function getUserById(userId: string): Promise<User | null> {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    fid: row.fid,
    phone: row.phone,
    email: row.email,
    username: row.username,
    name: row.name,
    pfpUrl: row.pfpUrl,
    displayName: row.displayName,
    profilePicture: row.profilePicture,
    accountAddress: row.accountAddress,
    pinHash: row.pinHash,
    failedPinAttempts: getFailedAttempts(row.failedPinAttempts),
    lockedAt: row.lockedAt || null,
    createdAt: row.createdAt || new Date(),
    updatedAt: row.updatedAt || new Date(),
  } as User;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);
  
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    fid: row.fid,
    phone: row.phone,
    email: row.email,
    username: row.username,
    name: row.name,
    pfpUrl: row.pfpUrl,
    displayName: row.displayName,
    profilePicture: row.profilePicture,
    accountAddress: row.accountAddress,
    pinHash: row.pinHash,
    failedPinAttempts: getFailedAttempts(row.failedPinAttempts),
    lockedAt: row.lockedAt || null,
    createdAt: row.createdAt || new Date(),
    updatedAt: row.updatedAt || new Date(),
  } as User;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    fid: row.fid,
    phone: row.phone,
    email: row.email,
    username: row.username,
    name: row.name,
    pfpUrl: row.pfpUrl,
    displayName: row.displayName,
    profilePicture: row.profilePicture,
    accountAddress: row.accountAddress,
    pinHash: row.pinHash,
    failedPinAttempts: getFailedAttempts(row.failedPinAttempts),
    lockedAt: row.lockedAt || null,
    createdAt: row.createdAt || new Date(),
    updatedAt: row.updatedAt || new Date(),
  } as User;
}

export async function getUserByAccountAddress(accountAddress: string): Promise<User | null> {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.accountAddress, accountAddress))
    .limit(1);
  
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    fid: row.fid,
    phone: row.phone,
    email: row.email,
    username: row.username,
    name: row.name,
    pfpUrl: row.pfpUrl,
    displayName: row.displayName,
    profilePicture: row.profilePicture,
    accountAddress: row.accountAddress,
    pinHash: row.pinHash,
    failedPinAttempts: getFailedAttempts(row.failedPinAttempts),
    lockedAt: row.lockedAt || null,
    createdAt: row.createdAt || new Date(),
    updatedAt: row.updatedAt || new Date(),
  } as User;
}

export async function updateUserDisplayName(userId: string, displayName: string): Promise<User | null> {
  const existing = await getUserById(userId);
  if (!existing) return null;

  const now = new Date();
  await db
    .update(users)
    .set({
      displayName,
      updatedAt: now,
    })
    .where(eq(users.id, userId));

  return {
    ...existing,
    displayName,
    updatedAt: now,
  } as User;
}

export interface UpdateUserProfileData {
  displayName?: string;
  profilePicture?: string | null; // App-specific profile picture (editable)
  phone?: string;
}

export async function updateUserProfile(userId: string, data: UpdateUserProfileData): Promise<User | null> {
  const existing = await getUserById(userId);
  if (!existing) return null;

  const now = new Date();
  const updateData: { displayName?: string; profilePicture?: string | null; phone?: string; updatedAt: Date } = { updatedAt: now };

  if (data.displayName !== undefined) {
    updateData.displayName = data.displayName;
  }
  if (data.profilePicture !== undefined) {
    updateData.profilePicture = data.profilePicture;
  }
  if (data.phone !== undefined) {
    updateData.phone = data.phone;
  }

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId));

  return {
    ...existing,
    ...updateData,
  } as User;
}

export interface CreateUserWithPhoneData {
  username: string;
  displayName: string; // name
  phone: string;
  email?: string;
  pin: string; // 4-digit PIN (will be hashed before storage)
}

export async function createUserWithPhone(data: CreateUserWithPhoneData): Promise<User> {
  const id = uuidv4();
  const now = new Date();
  
  // Hash the PIN before storing
  const pinHash = await bcrypt.hash(data.pin, BCRYPT_ROUNDS);
  
  const newUser = {
    id,
    fid: null,
    phone: data.phone,
    email: data.email || null,
    username: data.username,
    displayName: data.displayName,
    pfpUrl: null,
    pinHash,
    failedPinAttempts: 0,
    lockedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  
  await db.insert(users).values(newUser);
  
  return {
    ...newUser,
    lockedAt: null,
  } as User;
}

export async function getOrCreateUserByFid(
  fid: string,
  userData?: FarcasterUserData
): Promise<{ user: User; isNewUser: boolean }> {
  // Priority 1: Look up by accountAddress (wallet address) if provided
  // This is the primary identifier for Renaissance app users
  let existing: User | null = null;
  
  if (userData?.accountAddress) {
    existing = await getUserByAccountAddress(userData.accountAddress);
    if (existing) {
      console.log('🔍 [USER LOOKUP] Found user by accountAddress:', userData.accountAddress);
    }
  }
  
  // Priority 2: Fall back to fid lookup only if no accountAddress match
  if (!existing) {
    existing = await getUserByFid(fid);
    if (existing) {
      console.log('🔍 [USER LOOKUP] Found user by fid:', fid);
    }
  }
  
  if (existing) {
    // Update user if new data is provided - sync Farcaster/Renaissance data
    if (userData) {
      const now = new Date();
      const updateData: {
        fid?: string | null;
        username?: string | null;
        name?: string | null;
        pfpUrl?: string | null;
        accountAddress?: string | null;
        updatedAt: Date;
      } = { updatedAt: now };
      
      // Sync username, name, pfpUrl, and accountAddress from Farcaster/Renaissance
      // displayName and profilePicture are app-specific and won't be affected
      // Also update fid if it changed (e.g., user linked a Farcaster account later)
      if (fid && fid !== existing.fid) updateData.fid = fid;
      if (userData.username !== undefined) updateData.username = userData.username;
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.pfpUrl !== undefined) updateData.pfpUrl = userData.pfpUrl;
      if (userData.accountAddress !== undefined) updateData.accountAddress = userData.accountAddress;
      
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, existing.id));
      
      return {
        user: {
          ...existing,
          ...updateData,
        } as User,
        isNewUser: false,
      };
    }
    
    return { user: existing, isNewUser: false };
  }
  
  // Create new user - initialize app-specific fields with Farcaster data
  const id = uuidv4();
  const now = new Date();
  const newUser = {
    id,
    fid,
    username: userData?.username || null,
    name: userData?.name || null, // Synced from Farcaster
    pfpUrl: userData?.pfpUrl || null, // Synced from Farcaster
    displayName: userData?.name || null, // Initialize with Farcaster name
    profilePicture: userData?.pfpUrl || null, // Initialize with Farcaster pfp
    accountAddress: userData?.accountAddress || null, // From Renaissance auth
    createdAt: now,
    updatedAt: now,
  };
  
  console.log('🆕 [USER LOOKUP] Creating new user with accountAddress:', userData?.accountAddress, 'fid:', fid);
  
  await db.insert(users).values(newUser);
  
  return { user: newUser as User, isNewUser: true };
}

export async function upsertFarcasterAccount(
  userId: string,
  farcasterData: { fid: string; username: string }
): Promise<FarcasterAccount> {
  const existing = await db
    .select()
    .from(farcasterAccounts)
    .where(eq(farcasterAccounts.fid, farcasterData.fid))
    .limit(1);
  
  const now = new Date();
  
  if (existing.length > 0) {
    const existingAccount = existing[0];
    await db
      .update(farcasterAccounts)
      .set({
        userId,
        username: farcasterData.username,
        updatedAt: now,
      })
      .where(eq(farcasterAccounts.id, existingAccount.id));
    
    return {
      id: existingAccount.id,
      userId,
      fid: farcasterData.fid,
      username: farcasterData.username,
      createdAt: existingAccount.createdAt || now,
      updatedAt: now,
    } as FarcasterAccount;
  }
  
  const id = uuidv4();
  const record = {
    id,
    userId,
    fid: farcasterData.fid,
    username: farcasterData.username,
    createdAt: now,
    updatedAt: now,
  };
  
  await db.insert(farcasterAccounts).values(record);
  return record as FarcasterAccount;
}

export async function getFarcasterAccountByFid(
  fid: string
): Promise<FarcasterAccount | null> {
  const results = await db
    .select()
    .from(farcasterAccounts)
    .where(eq(farcasterAccounts.fid, fid))
    .limit(1);
  
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    userId: row.userId,
    fid: row.fid,
    username: row.username,
    createdAt: row.createdAt || new Date(),
    updatedAt: row.updatedAt || new Date(),
  } as FarcasterAccount;
}

// ============== PIN Security Functions ==============

/**
 * Check if a user account is currently locked
 */
export function isUserLocked(user: User): boolean {
  return user.lockedAt !== null && user.lockedAt !== undefined;
}

/**
 * Check if a user has a PIN set
 */
export function hasPin(user: User): boolean {
  return user.pinHash !== null && user.pinHash !== undefined;
}

/**
 * Verify a user's PIN
 * Returns true if PIN is correct, false otherwise
 */
export async function verifyUserPin(user: User, pin: string): Promise<boolean> {
  if (!user.pinHash) return false;
  return bcrypt.compare(pin, user.pinHash);
}

/**
 * Increment failed PIN attempts for a user
 * Returns the updated user and whether the account was locked
 */
export async function incrementFailedAttempts(userId: string): Promise<{ user: User; wasLocked: boolean }> {
  const existing = await getUserById(userId);
  if (!existing) throw new Error('User not found');

  const now = new Date();
  const newAttempts = existing.failedPinAttempts + 1;
  const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;

  await db
    .update(users)
    .set({
      failedPinAttempts: newAttempts,
      lockedAt: shouldLock ? now : existing.lockedAt,
      updatedAt: now,
    })
    .where(eq(users.id, userId));

  return {
    user: {
      ...existing,
      failedPinAttempts: newAttempts,
      lockedAt: shouldLock ? now : existing.lockedAt,
      updatedAt: now,
    },
    wasLocked: shouldLock,
  };
}

/**
 * Reset failed PIN attempts (called on successful login)
 */
export async function resetFailedAttempts(userId: string): Promise<void> {
  const now = new Date();
  await db
    .update(users)
    .set({
      failedPinAttempts: 0,
      updatedAt: now,
    })
    .where(eq(users.id, userId));
}

/**
 * Lock a user account
 */
export async function lockUser(userId: string): Promise<User | null> {
  const existing = await getUserById(userId);
  if (!existing) return null;

  const now = new Date();
  await db
    .update(users)
    .set({
      lockedAt: now,
      updatedAt: now,
    })
    .where(eq(users.id, userId));

  return {
    ...existing,
    lockedAt: now,
    updatedAt: now,
  };
}

/**
 * Unlock a user account (admin function)
 * Also resets failed PIN attempts
 */
export async function unlockUser(userId: string): Promise<User | null> {
  const existing = await getUserById(userId);
  if (!existing) return null;

  const now = new Date();
  await db
    .update(users)
    .set({
      lockedAt: null,
      failedPinAttempts: 0,
      updatedAt: now,
    })
    .where(eq(users.id, userId));

  return {
    ...existing,
    lockedAt: null,
    failedPinAttempts: 0,
    updatedAt: now,
  };
}

/**
 * Set a user's PIN (for users who don't have one yet)
 */
export async function setUserPin(userId: string, pin: string): Promise<User | null> {
  const existing = await getUserById(userId);
  if (!existing) return null;

  const now = new Date();
  const pinHash = await bcrypt.hash(pin, BCRYPT_ROUNDS);

  await db
    .update(users)
    .set({
      pinHash,
      updatedAt: now,
    })
    .where(eq(users.id, userId));

  return {
    ...existing,
    pinHash,
    updatedAt: now,
  };
}

/**
 * Update a user's PIN (requires verification of current PIN first)
 * This should be called after verifyUserPin succeeds
 */
export async function updateUserPin(userId: string, newPin: string): Promise<User | null> {
  const existing = await getUserById(userId);
  if (!existing) return null;

  const now = new Date();
  const pinHash = await bcrypt.hash(newPin, BCRYPT_ROUNDS);

  await db
    .update(users)
    .set({
      pinHash,
      failedPinAttempts: 0, // Reset failed attempts on successful PIN change
      updatedAt: now,
    })
    .where(eq(users.id, userId));

  return {
    ...existing,
    pinHash,
    failedPinAttempts: 0,
    updatedAt: now,
  };
}
