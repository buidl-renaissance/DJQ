import type { NextApiRequest, NextApiResponse } from 'next';
import { getBookingById } from '@/db/bookings';
import { createB2BRequest } from '@/db/bookings';
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
    const { username, targetUsername } = req.body;
    
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

    const targetUserResults = await db
      .select()
      .from(users)
      .where(eq(users.username, targetUsername))
      .limit(1);

    if (targetUserResults.length === 0) {
      return res.status(404).json({ error: 'Target user not found' });
    }

    const userId = userResults[0].id;
    const targetUserId = targetUserResults[0].id;

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

    return res.status(201).json({ request: b2bRequest });
  } catch (error) {
    console.error('Failed to create B2B request:', error);
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to create B2B request' 
    });
  }
}
