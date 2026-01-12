import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserByPhone, hasPin, setUserPin } from '@/db/user';

/**
 * Set PIN for a user who doesn't have one yet
 * POST /api/auth/set-pin
 * Body: { phone, pin }
 * 
 * This is used during login flow for legacy/miniapp users who don't have a PIN.
 * After setting PIN, the user is logged in.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, pin } = req.body as { phone?: string; pin?: string };

    // Validate required fields
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!pin || !pin.trim()) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    // Normalize phone number (remove spaces, dashes)
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Look up user by phone
    const user = await getUserByPhone(normalizedPhone);
    
    if (!user) {
      return res.status(404).json({ error: 'No account found with this phone number' });
    }

    // Check if user already has a PIN
    if (hasPin(user)) {
      return res.status(400).json({ 
        error: 'This account already has a PIN. Use the login flow instead.',
        hasPin: true,
      });
    }

    // Set the PIN
    const updatedUser = await setUserPin(user.id, pin);

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to set PIN' });
    }

    // Set session cookie to log them in
    res.setHeader('Set-Cookie', `user_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

    console.log('✅ [SET PIN] PIN set and user logged in:', {
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
    console.error('Error setting PIN:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
