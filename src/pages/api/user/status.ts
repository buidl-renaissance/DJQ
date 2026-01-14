import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById, updateUserStatus } from '@/db/user';

// Helper to get userId from session cookie
function getUserIdFromCookie(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie || '';
  const sessionMatch = cookies.match(/user_session=([^;]+)/);
  return sessionMatch ? sessionMatch[1] : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get current user from session
  const userId = getUserIdFromCookie(req);
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // POST - Update own status (deactivate/reactivate)
  if (req.method === 'POST') {
    try {
      const { action } = req.body as { action?: 'deactivate' | 'reactivate' };

      if (action === 'deactivate') {
        // Users can deactivate their own account
        const updatedUser = await updateUserStatus(userId, 'inactive');
        
        if (!updatedUser) {
          return res.status(500).json({ error: 'Failed to deactivate account' });
        }

        console.log(`🔴 [USER] User ${userId} deactivated their account`);

        return res.status(200).json({
          success: true,
          message: 'Account deactivated',
          user: {
            id: updatedUser.id,
            status: updatedUser.status,
          },
        });
      }

      if (action === 'reactivate') {
        // Users can only reactivate if they were inactive (not banned)
        if (user.status === 'banned') {
          return res.status(403).json({ error: 'Your account has been banned. Please contact support.' });
        }

        const updatedUser = await updateUserStatus(userId, 'active');
        
        if (!updatedUser) {
          return res.status(500).json({ error: 'Failed to reactivate account' });
        }

        console.log(`🟢 [USER] User ${userId} reactivated their account`);

        return res.status(200).json({
          success: true,
          message: 'Account reactivated',
          user: {
            id: updatedUser.id,
            status: updatedUser.status,
          },
        });
      }

      return res.status(400).json({ error: 'Invalid action. Use "deactivate" or "reactivate".' });
    } catch (error) {
      console.error('Error updating user status:', error);
      return res.status(500).json({ error: 'Failed to update account status' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
