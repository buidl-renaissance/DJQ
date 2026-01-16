import type { NextApiRequest, NextApiResponse } from 'next';
import { acceptB2BRequest, declineB2BRequest, getB2BRequestById, leaveB2BPartnership } from '@/db/bookings';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  try {
    const { action, username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    if (!action || !['accept', 'decline', 'leave'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Look up user by username
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (userResults.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResults[0].id;

    const request = await getB2BRequestById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    let updatedRequest;
    if (action === 'leave') {
      // Either party can leave an accepted B2B partnership
      if (request.requesterId !== userId && request.requesteeId !== userId) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      updatedRequest = await leaveB2BPartnership(id, userId);
    } else {
      // Accept/decline only by requestee
      if (request.requesteeId !== userId) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      if (action === 'accept') {
        updatedRequest = await acceptB2BRequest(id, userId);
      } else {
        updatedRequest = await declineB2BRequest(id, userId);
      }
    }

    return res.status(200).json({ request: updatedRequest });
  } catch (error) {
    console.error('Failed to update B2B request:', error);
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to update B2B request' 
    });
  }
}
