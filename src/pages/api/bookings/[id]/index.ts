import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';
import { slotBookings, timeSlots, events, users, b2bRequests } from '@/db/schema';
import { cancelBooking, getBookingById } from '@/db/bookings';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * Check if a user is the host of the event that contains the given booking
 */
async function isUserHostOfBooking(bookingId: string, userId: string): Promise<boolean> {
  const result = await db
    .select({ hostId: events.hostId })
    .from(slotBookings)
    .innerJoin(timeSlots, eq(slotBookings.slotId, timeSlots.id))
    .innerJoin(events, eq(timeSlots.eventId, events.id))
    .where(eq(slotBookings.id, bookingId))
    .limit(1);

  return result.length > 0 && result[0].hostId === userId;
}

/**
 * Find all bookings that are part of the same consecutive set
 * (same DJ, same event, consecutive slots, same status)
 */
async function findRelatedBookings(bookingId: string) {
  // Get the initial booking with slot info
  const initialBooking = await db
    .select({
      booking: slotBookings,
      slot: timeSlots,
    })
    .from(slotBookings)
    .innerJoin(timeSlots, eq(slotBookings.slotId, timeSlots.id))
    .where(eq(slotBookings.id, bookingId))
    .limit(1);

  if (!initialBooking[0]) return [];

  const { booking, slot } = initialBooking[0];
  const djId = booking.djId;
  const eventId = slot.eventId;
  const status = booking.status;

  // Get all bookings by the same DJ for the same event with the same status
  const allBookings = await db
    .select({
      booking: slotBookings,
      slot: timeSlots,
    })
    .from(slotBookings)
    .innerJoin(timeSlots, eq(slotBookings.slotId, timeSlots.id))
    .where(
      and(
        eq(slotBookings.djId, djId),
        eq(timeSlots.eventId, eventId),
        eq(slotBookings.status, status)
      )
    );

  // Sort by slot index
  const sorted = allBookings.sort((a, b) => a.slot.slotIndex - b.slot.slotIndex);

  // Find the consecutive group that contains our initial slot
  const groups: typeof sorted[] = [];
  let currentGroup: typeof sorted = [];

  for (const row of sorted) {
    if (currentGroup.length === 0) {
      currentGroup.push(row);
    } else {
      const lastSlot = currentGroup[currentGroup.length - 1].slot;
      if (row.slot.slotIndex === lastSlot.slotIndex + 1) {
        currentGroup.push(row);
      } else {
        groups.push(currentGroup);
        currentGroup = [row];
      }
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // Find the group that contains our booking
  for (const group of groups) {
    if (group.some(r => r.booking.id === bookingId)) {
      return group;
    }
  }

  return [initialBooking[0]];
}

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

      // Find all related bookings (consecutive slots)
      const relatedBookings = await findRelatedBookings(id);
      
      if (relatedBookings.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Get event info from the first booking
      const eventResult = await db
        .select()
        .from(events)
        .where(eq(events.id, relatedBookings[0].slot.eventId))
        .limit(1);

      if (!eventResult[0]) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const event = eventResult[0];

      // Calculate combined time range
      const sortedByTime = [...relatedBookings].sort(
        (a, b) => a.slot.slotIndex - b.slot.slotIndex
      );
      const firstSlot = sortedByTime[0].slot;
      const lastSlot = sortedByTime[sortedByTime.length - 1].slot;

      // Get the booker's info
      const bookerResult = await db
        .select()
        .from(users)
        .where(eq(users.id, booking.djId))
        .limit(1);

      const booker = bookerResult[0] ? {
        id: bookerResult[0].id,
        displayName: bookerResult[0].displayName || 'Unknown',
        username: bookerResult[0].username || 'unknown',
      } : null;

      // Check for B2B partners on any of the bookings (up to 2 partners = 3 total participants)
      const bookingIds = relatedBookings.map(r => r.booking.id);
      const b2bPartners: { id: string; displayName: string; username: string }[] = [];
      
      const b2bResults = await db
        .select({
          request: b2bRequests,
        })
        .from(b2bRequests)
        .where(
          and(
            inArray(b2bRequests.bookingId, bookingIds),
            eq(b2bRequests.status, 'accepted')
          )
        );

      for (const b2bResult of b2bResults) {
        const bookingDjId = booking.djId;
        const partnerUserId = b2bResult.request.requesterId === bookingDjId
          ? b2bResult.request.requesteeId
          : b2bResult.request.requesterId;

        const partnerResult = await db
          .select()
          .from(users)
          .where(eq(users.id, partnerUserId))
          .limit(1);

        if (partnerResult[0]) {
          b2bPartners.push({
            id: partnerResult[0].id,
            displayName: partnerResult[0].displayName || 'Unknown',
            username: partnerResult[0].username || 'unknown',
          });
        }
      }

      // Check for pending B2B requests on any booking
      const pendingB2BRequests: { id: string; targetUser: { displayName: string; username: string } }[] = [];
      
      const pendingB2B = await db
        .select({
          request: b2bRequests,
        })
        .from(b2bRequests)
        .where(
          and(
            inArray(b2bRequests.bookingId, bookingIds),
            eq(b2bRequests.status, 'pending')
          )
        );

      for (const pending of pendingB2B) {
        const targetUserId = pending.request.requesteeId;
        const targetResult = await db
          .select()
          .from(users)
          .where(eq(users.id, targetUserId))
          .limit(1);

        if (targetResult[0]) {
          pendingB2BRequests.push({
            id: pending.request.id,
            targetUser: {
              displayName: targetResult[0].displayName || 'Unknown',
              username: targetResult[0].username || 'unknown',
            },
          });
        }
      }

      return res.status(200).json({
        booking: {
          id: relatedBookings[0].booking.id,
          bookingIds: bookingIds,
          slotCount: relatedBookings.length,
          status: relatedBookings[0].booking.status,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.eventDate,
          slotStartTime: firstSlot.startTime,
          slotEndTime: lastSlot.endTime,
          booker,
          b2bPartners,
          pendingB2BRequests,
          allowB2B: event.allowB2B,
          maxB2BPartners: 2, // Max 2 additional partners = 3 total participants
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

      // Check authorization: user must be either the booking owner OR the event host
      if (userId) {
        const isOwner = booking.djId === userId;
        const isHost = await isUserHostOfBooking(id, userId);
        
        if (!isOwner && !isHost) {
          return res.status(403).json({ error: 'Not authorized' });
        }
      }

      // Find all related bookings and cancel them all
      const relatedBookings = await findRelatedBookings(id);
      
      for (const related of relatedBookings) {
        await cancelBooking(related.booking.id);
      }

      return res.status(200).json({ 
        success: true,
        cancelledCount: relatedBookings.length,
      });
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to cancel booking' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
