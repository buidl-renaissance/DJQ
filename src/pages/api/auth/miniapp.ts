import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { getUserByUsernameOnly, getUserById, upsertFarcasterAccount } from '@/db/user';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';

/**
 * Authenticate user from Renaissance Mini App SDK context
 * Uses username as the primary identifier
 * If user not found by username, requires phone number entry
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fid, username, displayName, pfpUrl, renaissanceUserId, accountAddress } = req.body as {
      fid?: string;
      username?: string;
      displayName?: string;
      pfpUrl?: string;
      renaissanceUserId?: string;
      accountAddress?: string; // Wallet address (synced from SDK)
    };

    console.log('🔐 [MINIAPP AUTH] Authenticating mini app user:', { 
      fid, 
      username, 
      displayName, 
      renaissanceUserId, 
      accountAddress: accountAddress || '(not provided)',
    });

    // If no username provided, check if user has an existing valid session
    // This handles cases where SDK context isn't ready yet but user is already logged in
    if (!username) {
      console.log('⚠️ [MINIAPP AUTH] No username provided, checking existing session...');
      
      const cookies = req.headers.cookie || '';
      const sessionMatch = cookies.match(/user_session=([^;]+)/);
      
      if (sessionMatch && sessionMatch[1]) {
        const sessionUserId = sessionMatch[1];
        const existingUser = await getUserById(sessionUserId);
        
        if (existingUser) {
          console.log('✅ [MINIAPP AUTH] Found existing session user:', {
            userId: existingUser.id,
            accountAddress: existingUser.accountAddress,
            hasPhone: !!existingUser.phone,
          });
          
          // Return existing user - they're already authenticated
          return res.status(200).json({
            success: true,
            needsPhone: !existingUser.phone,
            user: {
              id: existingUser.id,
              fid: existingUser.fid,
              username: existingUser.username,
              phone: existingUser.phone,
              name: existingUser.name,
              pfpUrl: existingUser.pfpUrl,
              displayName: existingUser.displayName,
              profilePicture: existingUser.profilePicture,
              accountAddress: existingUser.accountAddress,
              hasPin: !!existingUser.pinHash,
              status: existingUser.status,
            },
          });
        } else {
          // Session user not found (deleted from DB) - clear invalid session
          console.log('⚠️ [MINIAPP AUTH] Session user not found, clearing invalid session');
          res.setHeader('Set-Cookie', 'user_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
        }
      }
      
      // No session and no username - need phone
      console.log('⚠️ [MINIAPP AUTH] No session found, requiring phone');
      return res.status(200).json({
        success: false,
        needsPhone: true,
        message: 'No username found. Please enter your phone number.',
        pendingUserData: {
          fid,
          username,
          displayName,
          pfpUrl,
        },
      });
    }

    // Look up user by username only (case-insensitive)
    console.log('🔍 [MINIAPP AUTH] Looking up user by username (case-insensitive):', username);
    const result = await getUserByUsernameOnly(username, {
      fid: fid || '',
      username: username || undefined,
      name: displayName || undefined,
      pfpUrl: pfpUrl || undefined,
      accountAddress: accountAddress || undefined,
    });

    if (!result) {
      // No user found with this username - create a new user with Renaissance data
      console.log('🆕 [MINIAPP AUTH] Creating new user for username:', username);
      
      const id = uuidv4();
      const now = new Date();
      const newUser = {
        id,
        fid: fid || null,
        username: username || null,
        name: displayName || null,
        pfpUrl: pfpUrl || null,
        displayName: displayName || null,
        profilePicture: pfpUrl || null,
        accountAddress: accountAddress || null,
        phone: null,
        email: null,
        pinHash: null,
        failedPinAttempts: 0,
        lockedAt: null,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };
      
      await db.insert(users).values(newUser);
      
      console.log('✅ [MINIAPP AUTH] Created new user:', {
        userId: id,
        username,
        accountAddress,
      });
      
      // Link Farcaster account if fid provided
      if (fid) {
        await upsertFarcasterAccount(id, {
          fid,
          username: username || '',
        });
      }
      
      // Set session cookie
      res.setHeader('Set-Cookie', `user_session=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
      
      return res.status(200).json({
        success: true,
        needsPhone: true,
        needsPin: true,
        user: {
          id,
          fid,
          username,
          phone: null,
          name: displayName,
          pfpUrl,
          displayName,
          profilePicture: pfpUrl,
          accountAddress,
          hasPin: false,
          status: 'active',
        },
      });
    }

    const { user } = result;

    // Link/update Farcaster account if username provided
    if (username && fid) {
      await upsertFarcasterAccount(user.id, {
        fid,
        username,
      });
    }

    // Set session cookie
    res.setHeader('Set-Cookie', `user_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

    console.log('✅ [MINIAPP AUTH] User authenticated successfully:', {
      userId: user.id,
      username: user.username,
      accountAddress: user.accountAddress,
    });

    return res.status(200).json({
      success: true,
      needsPhone: !user.phone, // Still prompt to add phone if missing
      user: {
        id: user.id,
        fid: user.fid,
        username: user.username,
        phone: user.phone,
        name: user.name,
        pfpUrl: user.pfpUrl,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        accountAddress: user.accountAddress,
        hasPin: !!user.pinHash,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Error authenticating mini app user:', error);
    
    // Clear session cookie on error to allow reauth
    res.setHeader('Set-Cookie', 'user_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    
    return res.status(500).json({ 
      error: 'Internal server error',
      shouldReauth: true,
    });
  }
}
