import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserByPhone } from '@/db/user';

/**
 * Login with phone number (no verification - simple lookup)
 * POST /api/auth/phone-login
 * Body: { phone }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone } = req.body as { phone?: string };

    // Validate required fields
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Normalize phone number (remove spaces, dashes)
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Look up user by phone
    const user = await getUserByPhone(normalizedPhone);
    
    if (!user) {
      return res.status(404).json({ error: 'No account found with this phone number' });
    }

    // Set session cookie
    res.setHeader('Set-Cookie', `user_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

    console.log('✅ [PHONE LOGIN] User logged in successfully:', {
      userId: user.id,
      username: user.username,
      phone: user.phone,
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        phone: user.phone,
        email: user.email,
        fid: user.fid,
        pfpUrl: user.pfpUrl,
      },
    });
  } catch (error) {
    console.error('Error during phone login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
