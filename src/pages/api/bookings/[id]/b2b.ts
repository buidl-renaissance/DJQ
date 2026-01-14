import type { NextApiRequest, NextApiResponse } from 'next';
import { getBookingById } from '@/db/bookings';
import { createB2BRequest, acceptB2BRequest } from '@/db/bookings';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid booking ID' });
  }

  try {
    const { username, targetUsername, fromSharedInvite } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    if (!targetUsername) {
      return res.status(400).json({ error: 'Target username is required' });
    }

    // Look up users by username
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (userResults.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResults[0];

    // Check if requesting user is active
    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Your account is deactivated. Please reactivate your account to send B2B requests.' });
    }
    if (user.status === 'banned') {
      return res.status(403).json({ error: 'Your account has been banned.' });
    }

    const targetUserResults = await db
      .select()
      .from(users)
      .where(eq(users.username, targetUsername))
      .limit(1);

    if (targetUserResults.length === 0) {
      return res.status(404).json({ error: 'Target user not found' });
    }

    const targetUser = targetUserResults[0];

    // Check if target user is active
    if (targetUser.status === 'inactive' || targetUser.status === 'banned') {
      return res.status(400).json({ error: 'The target user is not available for B2B requests.' });
    }

    const userId = user.id;
    const targetUserId = targetUser.id;

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Determine initiator type
    const isBooker = booking.djId === userId;
    
    if (!isBooker && targetUserId !== booking.djId) {
      return res.status(400).json({ error: 'Invalid B2B request' });
    }

    const b2bRequest = await createB2BRequest({
      bookingId: id,
      requesterId: userId,
      requesteeId: targetUserId,
      initiatedBy: isBooker ? 'booker' : 'requester',
    });

    // If this is from a shared invite link and the requester is joining the booker's slot,
    // auto-accept the request since the booker already shared the invite
    if (fromSharedInvite && !isBooker) {
      // The booker (targetUserId) already invited by sharing the link, so auto-accept
      const acceptedRequest = await acceptB2BRequest(b2bRequest.id, targetUserId);
      return res.status(201).json({ request: acceptedRequest });
    }

    return res.status(201).json({ request: b2bRequest });
  } catch (error) {
    console.error('Failed to create B2B request:', error);
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to create B2B request' 
    });
  }
}
