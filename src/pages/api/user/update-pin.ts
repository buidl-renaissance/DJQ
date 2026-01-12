import type { NextApiRequest, NextApiResponse } from 'next';
import { 
  getUserById, 
  verifyUserPin, 
  updateUserPin, 
  incrementFailedAttempts, 
  isUserLocked,
  hasPin 
} from '@/db/user';

/**
 * Update user's PIN
 * POST /api/user/update-pin
 * Body: { currentPin, newPin }
 * 
 * Requires current PIN verification before updating.
 * Same lockout logic applies - 3 failed attempts locks the account.
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
    const userId = sessionMatch ? sessionMatch[1] : null;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user
    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if account is locked
    if (isUserLocked(user)) {
      return res.status(423).json({ 
        error: 'Account is locked. Please contact an administrator.',
        isLocked: true,
      });
    }

    const { currentPin, newPin } = req.body as { currentPin?: string; newPin?: string };

    // Validate inputs
    if (!currentPin) {
      return res.status(400).json({ error: 'Current PIN is required' });
    }

    if (!newPin) {
      return res.status(400).json({ error: 'New PIN is required' });
    }

    // Validate new PIN format (4 digits)
    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ error: 'New PIN must be exactly 4 digits' });
    }

    // Check if user has a PIN set
    if (!hasPin(user)) {
      return res.status(400).json({ 
        error: 'No PIN is currently set on this account. Please contact an administrator.',
      });
    }

    // Verify current PIN
    const pinValid = await verifyUserPin(user, currentPin);

    if (!pinValid) {
      // Increment failed attempts
      const { wasLocked } = await incrementFailedAttempts(user.id);

      if (wasLocked) {
        console.log('🔒 [UPDATE PIN] Account locked due to failed PIN attempts:', {
          userId: user.id,
          username: user.username,
        });
        return res.status(423).json({ 
          error: 'Account has been locked due to too many failed attempts. Please contact an administrator.',
          isLocked: true,
        });
      }

      const attemptsRemaining = 3 - (user.failedPinAttempts + 1);
      console.log('❌ [UPDATE PIN] Invalid current PIN:', {
        userId: user.id,
        username: user.username,
        attemptsRemaining,
      });

      return res.status(401).json({ 
        error: `Invalid current PIN. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`,
        attemptsRemaining,
      });
    }

    // Update the PIN
    const updatedUser = await updateUserPin(user.id, newPin);

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update PIN' });
    }

    console.log('✅ [UPDATE PIN] PIN updated successfully:', {
      userId: user.id,
      username: user.username,
    });

    return res.status(200).json({
      success: true,
      message: 'PIN updated successfully',
    });
  } catch (error) {
    console.error('Error updating PIN:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
