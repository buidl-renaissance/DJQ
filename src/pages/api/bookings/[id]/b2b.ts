import type { NextApiRequest, NextApiResponse } from 'next';
import { getBookingById } from '@/db/bookings';
import { createB2BRequest } from '@/db/bookings';

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
    // TODO: Get authenticated user ID from session
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID required' });
    }

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
