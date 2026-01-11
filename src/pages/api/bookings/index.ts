import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';
import { slotBookings, timeSlots, events, users, b2bRequests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface BookingWithSlot {
  booking: typeof slotBookings.$inferSelect;
  slot: typeof timeSlots.$inferSelect;
  event: typeof events.$inferSelect;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required' });
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

    // Group consecutive slots by event and status
    const groupedBookings = groupConsecutiveSlots(bookings);

    const bookingsWithB2B = await Promise.all(
      groupedBookings.map(async (group) => {
        // Use the first booking ID for B2B lookups (B2B is per-slot)
        const primaryBookingId = group.bookingIds[0];
        
        // Check for B2B partner on any of the bookings in this group
        let b2bPartner: string | null = null;
        let hasPendingB2B = false;
        
        for (const bookingId of group.bookingIds) {
          const b2bResult = await db
            .select({
              request: b2bRequests,
            })
            .from(b2bRequests)
            .where(
              and(
                eq(b2bRequests.bookingId, bookingId),
                eq(b2bRequests.status, 'accepted')
              )
            )
            .limit(1);

          if (b2bResult[0] && !b2bPartner) {
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
                eq(b2bRequests.bookingId, bookingId),
                eq(b2bRequests.status, 'pending')
              )
            )
            .limit(1);

          if (pendingB2B.length > 0) {
            hasPendingB2B = true;
          }
        }

        return {
          id: primaryBookingId,
          bookingIds: group.bookingIds,
          eventId: group.eventId,
          eventTitle: group.eventTitle,
          eventDate: group.eventDate,
          slotStartTime: group.slotStartTime,
          slotEndTime: group.slotEndTime,
          status: group.status,
          slotCount: group.slotCount,
          b2bPartner,
          hasPendingB2B,
        };
      })
    );

    return res.status(200).json({ bookings: bookingsWithB2B });
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}

/**
 * Groups consecutive slot bookings for the same event into single entries
 */
function groupConsecutiveSlots(bookings: BookingWithSlot[]) {
  if (bookings.length === 0) return [];

  // Sort by event, status, and slot index
  const sorted = [...bookings].sort((a, b) => {
    if (a.event.id !== b.event.id) return a.event.id.localeCompare(b.event.id);
    if (a.booking.status !== b.booking.status) return a.booking.status.localeCompare(b.booking.status);
    return a.slot.slotIndex - b.slot.slotIndex;
  });

  const groups: {
    bookingIds: string[];
    eventId: string;
    eventTitle: string;
    eventDate: Date;
    slotStartTime: Date;
    slotEndTime: Date;
    status: string;
    slotCount: number;
    lastSlotIndex: number;
  }[] = [];

  for (const row of sorted) {
    const lastGroup = groups[groups.length - 1];
    
    // Check if this slot is consecutive with the last group
    const isConsecutive = lastGroup &&
      lastGroup.eventId === row.event.id &&
      lastGroup.status === row.booking.status &&
      row.slot.slotIndex === lastGroup.lastSlotIndex + 1;

    if (isConsecutive) {
      // Extend the existing group
      lastGroup.bookingIds.push(row.booking.id);
      lastGroup.slotEndTime = row.slot.endTime;
      lastGroup.slotCount++;
      lastGroup.lastSlotIndex = row.slot.slotIndex;
    } else {
      // Start a new group
      groups.push({
        bookingIds: [row.booking.id],
        eventId: row.event.id,
        eventTitle: row.event.title,
        eventDate: row.event.eventDate,
        slotStartTime: row.slot.startTime,
        slotEndTime: row.slot.endTime,
        status: row.booking.status,
        slotCount: 1,
        lastSlotIndex: row.slot.slotIndex,
      });
    }
  }

  return groups;
}
