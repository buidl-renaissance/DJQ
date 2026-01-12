import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById, hasPin, setUserPin } from '@/db/user';

/**
 * Set PIN for authenticated user who doesn't have one yet
 * POST /api/user/set-pin
 * Body: { pin }
 * 
 * This is used from the account page for users who logged in via miniapp
 * and don't have a PIN yet but want to enable web login.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from session cookie
    const cookies = req.headers.cookie || '';
    const sessionMatch = cookies.match(/user_session=([^;]+)/);
    
    if (!sessionMatch || !sessionMatch[1]) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = sessionMatch[1];
    const user = await getUserById(userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user already has a PIN
    if (hasPin(user)) {
      return res.status(400).json({ 
        error: 'You already have a PIN set. Use the Change PIN form instead.',
        hasPin: true,
      });
    }

    const { pin } = req.body as { pin?: string };

    // Validate PIN
    if (!pin || !pin.trim()) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    // Set the PIN
    const updatedUser = await setUserPin(user.id, pin);

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to set PIN' });
    }

    console.log('✅ [SET PIN] PIN set for user:', {
      userId: user.id,
      username: user.username,
    });

    return res.status(200).json({
      success: true,
      message: 'PIN set successfully',
    });
  } catch (error) {
    console.error('Error setting PIN:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
