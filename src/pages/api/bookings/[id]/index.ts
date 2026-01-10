import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';
import { slotBookings, timeSlots, events, users, b2bRequests } from '@/db/schema';
import { cancelBooking, getBookingById } from '@/db/bookings';
import { eq, and } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, username } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid booking ID' });
  }

  // Helper to get userId from username
  const getUserIdFromUsername = async (uname: string) => {
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.username, uname))
      .limit(1);
    return userResults.length > 0 ? userResults[0].id : null;
  };

  if (req.method === 'GET') {
    try {
      const userId = username && typeof username === 'string' 
        ? await getUserIdFromUsername(username) 
        : null;

      const booking = await getBookingById(id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Verify ownership if username provided
      if (userId && booking.djId !== userId) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Get full booking details
      const fullBooking = await db
        .select({
          booking: slotBookings,
          slot: timeSlots,
          event: events,
        })
        .from(slotBookings)
        .innerJoin(timeSlots, eq(slotBookings.slotId, timeSlots.id))
        .innerJoin(events, eq(timeSlots.eventId, events.id))
        .where(eq(slotBookings.id, id))
        .limit(1);

      if (!fullBooking[0]) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const row = fullBooking[0];

      // Check for B2B partner
      const b2bResult = await db
        .select({
          request: b2bRequests,
        })
        .from(b2bRequests)
        .where(
          and(
            eq(b2bRequests.bookingId, id),
            eq(b2bRequests.status, 'accepted')
          )
        )
        .limit(1);

      let b2bPartner: { id: string; displayName: string; username: string } | null = null;
      if (b2bResult[0]) {
        // Use booking's djId to determine who the partner is
        const bookingDjId = booking.djId;
        const partnerUserId = b2bResult[0].request.requesterId === bookingDjId
          ? b2bResult[0].request.requesteeId
          : b2bResult[0].request.requesterId;

        const partnerResult = await db
          .select()
          .from(users)
          .where(eq(users.id, partnerUserId))
          .limit(1);

        if (partnerResult[0]) {
          b2bPartner = {
            id: partnerResult[0].id,
            displayName: partnerResult[0].displayName || 'Unknown',
            username: partnerResult[0].username || 'unknown',
          };
        }
      }

      // Check for pending B2B request
      const pendingB2B = await db
        .select({
          request: b2bRequests,
        })
        .from(b2bRequests)
        .where(
          and(
            eq(b2bRequests.bookingId, id),
            eq(b2bRequests.status, 'pending')
          )
        )
        .limit(1);

      let pendingB2BRequest: { id: string; targetUser: { displayName: string; username: string } } | null = null;
      if (pendingB2B[0]) {
        const targetUserId = pendingB2B[0].request.requesteeId;
        const targetResult = await db
          .select()
          .from(users)
          .where(eq(users.id, targetUserId))
          .limit(1);

        if (targetResult[0]) {
          pendingB2BRequest = {
            id: pendingB2B[0].request.id,
            targetUser: {
              displayName: targetResult[0].displayName || 'Unknown',
              username: targetResult[0].username || 'unknown',
            },
          };
        }
      }

      return res.status(200).json({
        booking: {
          id: row.booking.id,
          status: row.booking.status,
          eventId: row.event.id,
          eventTitle: row.event.title,
          eventDate: row.event.eventDate,
          slotStartTime: row.slot.startTime,
          slotEndTime: row.slot.endTime,
          b2bPartner,
          pendingB2BRequest,
          allowB2B: row.event.allowB2B,
        },
      });
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      return res.status(500).json({ error: 'Failed to fetch booking' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleteUsername = req.body?.username;
      const userId = deleteUsername 
        ? await getUserIdFromUsername(deleteUsername) 
        : null;

      const booking = await getBookingById(id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Verify ownership if username provided
      if (userId && booking.djId !== userId) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await cancelBooking(id);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to cancel booking' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
