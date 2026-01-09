import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';
import { slotBookings, timeSlots, events, users, b2bRequests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // TODO: Get authenticated user ID from session
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get all bookings for the user with event and slot info
    const bookings = await db
      .select({
        booking: slotBookings,
        slot: timeSlots,
        event: events,
      })
      .from(slotBookings)
      .innerJoin(timeSlots, eq(slotBookings.slotId, timeSlots.id))
      .innerJoin(events, eq(timeSlots.eventId, events.id))
      .where(eq(slotBookings.djId, userId));

    const bookingsWithB2B = await Promise.all(
      bookings.map(async (row) => {
        // Check for B2B partner
        const b2bResult = await db
          .select({
            request: b2bRequests,
          })
          .from(b2bRequests)
          .where(
            and(
              eq(b2bRequests.bookingId, row.booking.id),
              eq(b2bRequests.status, 'accepted')
            )
          )
          .limit(1);

        let b2bPartner: string | null = null;
        if (b2bResult[0]) {
          const partnerUserId = b2bResult[0].request.requesterId === userId
            ? b2bResult[0].request.requesteeId
            : b2bResult[0].request.requesterId;

          const partnerResult = await db
            .select()
            .from(users)
            .where(eq(users.id, partnerUserId))
            .limit(1);

          if (partnerResult[0]) {
            b2bPartner = partnerResult[0].displayName || partnerResult[0].username || 'Unknown';
          }
        }

        // Check for pending B2B requests
        const pendingB2B = await db
          .select()
          .from(b2bRequests)
          .where(
            and(
              eq(b2bRequests.bookingId, row.booking.id),
              eq(b2bRequests.status, 'pending')
            )
          )
          .limit(1);

        return {
          id: row.booking.id,
          eventId: row.event.id,
          eventTitle: row.event.title,
          eventDate: row.event.eventDate,
          slotStartTime: row.slot.startTime,
          slotEndTime: row.slot.endTime,
          status: row.booking.status,
          b2bPartner,
          hasPendingB2B: pendingB2B.length > 0,
        };
      })
    );

    return res.status(200).json({ bookings: bookingsWithB2B });
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}
