import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrCreateUserByFid, upsertFarcasterAccount } from '@/db/user';

/**
 * Authenticate user from Farcaster Mini App SDK context
 * This endpoint receives user data from the SDK's context.user and creates/updates the user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // displayName from Farcaster SDK will be stored as 'name' (synced field)
    const { fid, username, displayName, pfpUrl, renaissanceUserId, accountAddress } = req.body as {
      fid?: string;
      username?: string;
      displayName?: string; // From Farcaster, stored as 'name'
      pfpUrl?: string;
      renaissanceUserId?: string;
      accountAddress?: string; // Wallet address from Renaissance auth
    };

    if (!fid) {
      return res.status(400).json({ error: 'fid is required' });
    }

    console.log('🔐 [MINIAPP AUTH] Authenticating mini app user:', { fid, username, displayName, renaissanceUserId, accountAddress });
    console.log('🔐 [MINIAPP AUTH] Request headers:', {
      origin: req.headers.origin,
      referer: req.headers.referer,
      'user-agent': req.headers['user-agent']?.substring(0, 50),
    });

    // Get or create user in database
    // Farcaster's displayName is stored as 'name' (synced from parent app)
    const { user, isNewUser } = await getOrCreateUserByFid(fid, {
      fid,
      username: username || undefined,
      name: displayName || undefined, // Store Farcaster displayName as 'name'
      pfpUrl: pfpUrl || undefined,
      accountAddress: accountAddress || undefined, // Store wallet address from Renaissance
    });

    // Link/update Farcaster account
    if (username) {
      await upsertFarcasterAccount(user.id, {
        fid,
        username,
      });
    }

    // Set session cookie
    res.setHeader('Set-Cookie', `user_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`); // 24 hours

    console.log('✅ [MINIAPP AUTH] User authenticated successfully:', {
      userId: user.id,
      fid: user.fid,
      username: user.username,
      isNewUser,
    });

    // Check if user needs to add phone number (new users or existing users without phone)
    const needsPhone = !user.phone;

    return res.status(200).json({
      success: true,
      isNewUser,
      needsPhone,
      user: {
        id: user.id,
        fid: user.fid,
        username: user.username,
        phone: user.phone,
        name: user.name, // Synced from Farcaster
        pfpUrl: user.pfpUrl, // Synced from Farcaster
        displayName: user.displayName, // App-specific (editable)
        profilePicture: user.profilePicture, // App-specific (editable)
        accountAddress: user.accountAddress, // From Renaissance auth
      },
    });
  } catch (error) {
    console.error('Error authenticating mini app user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
