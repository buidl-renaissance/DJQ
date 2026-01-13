import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserByAccountAddressOnly, getUserById, upsertFarcasterAccount } from '@/db/user';

/**
 * Authenticate user from Renaissance Mini App SDK context
 * Uses accountAddress (wallet address) as the primary identifier
 * If user not found by accountAddress, requires phone number entry
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
      accountAddress?: string; // Wallet address - primary identifier
    };

    console.log('🔐 [MINIAPP AUTH] Authenticating mini app user:', { 
      fid, 
      username, 
      displayName, 
      renaissanceUserId, 
      accountAddress: accountAddress || '(not provided)',
    });

    // If no accountAddress provided, check if user has an existing valid session
    // This handles cases where SDK context isn't ready yet but user is already logged in
    if (!accountAddress) {
      console.log('⚠️ [MINIAPP AUTH] No accountAddress provided, checking existing session...');
      
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
            },
          });
        }
      }
      
      // No session and no accountAddress - need phone
      console.log('⚠️ [MINIAPP AUTH] No session found, requiring phone');
      return res.status(200).json({
        success: false,
        needsPhone: true,
        message: 'No wallet address found. Please enter your phone number.',
        pendingUserData: {
          fid,
          username,
          displayName,
          pfpUrl,
        },
      });
    }

    // Look up user by accountAddress only
    const result = await getUserByAccountAddressOnly(accountAddress, {
      fid: fid || '',
      username: username || undefined,
      name: displayName || undefined,
      pfpUrl: pfpUrl || undefined,
      accountAddress,
    });

    if (!result) {
      // No user found with this accountAddress - require phone verification
      console.log('🔐 [MINIAPP AUTH] No user found for accountAddress, requiring phone:', accountAddress);
      return res.status(200).json({
        success: false,
        needsPhone: true,
        message: 'Please enter your phone number to continue.',
        // Pass along the Renaissance data for later linking
        pendingUserData: {
          fid,
          username,
          displayName,
          pfpUrl,
          accountAddress,
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
      accountAddress: user.accountAddress,
      username: user.username,
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
      },
    });
  } catch (error) {
    console.error('Error authenticating mini app user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
