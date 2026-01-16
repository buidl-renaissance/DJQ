import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';
import { slotBookings, timeSlots, events, users, b2bRequests } from '@/db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';

interface BookingWithSlot {
  booking: typeof slotBookings.$inferSelect;
  slot: typeof timeSlots.$inferSelect;
  event: typeof events.$inferSelect;
  isB2BPartner?: boolean;
  b2bPartnerName?: string;
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

    // Get all bookings where the user is the DJ
    const ownBookings = await db
      .select({
        booking: slotBookings,
        slot: timeSlots,
        event: events,
      })
      .from(slotBookings)
      .innerJoin(timeSlots, eq(slotBookings.slotId, timeSlots.id))
      .innerJoin(events, eq(timeSlots.eventId, events.id))
      .where(eq(slotBookings.djId, userId));

    // Get all accepted B2B requests where the user is a partner (not the original booker)
    const b2bPartnerRequests = await db
      .select({
        request: b2bRequests,
      })
      .from(b2bRequests)
      .where(
        and(
          eq(b2bRequests.status, 'accepted'),
          or(
            eq(b2bRequests.requesterId, userId),
            eq(b2bRequests.requesteeId, userId)
          )
        )
      );

    // Get the booking IDs from B2B requests where the user is the partner (not the original DJ)
    const b2bBookingIds: string[] = [];
    const b2bPartnerMap = new Map<string, string>(); // bookingId -> partner userId

    for (const { request } of b2bPartnerRequests) {
      // Get the booking to check who the original DJ is
      const bookingResult = await db
        .select()
        .from(slotBookings)
        .where(eq(slotBookings.id, request.bookingId))
        .limit(1);

      if (bookingResult.length > 0) {
        const booking = bookingResult[0];
        // Only include if the user is NOT the original DJ (they're the B2B partner)
        if (booking.djId !== userId) {
          b2bBookingIds.push(request.bookingId);
          b2bPartnerMap.set(request.bookingId, booking.djId);
        }
      }
    }

    // Get bookings where user is a B2B partner
    const b2bPartnerBookings: BookingWithSlot[] = [];
    if (b2bBookingIds.length > 0) {
      const b2bBookingsRaw = await db
        .select({
          booking: slotBookings,
          slot: timeSlots,
          event: events,
        })
        .from(slotBookings)
        .innerJoin(timeSlots, eq(slotBookings.slotId, timeSlots.id))
        .innerJoin(events, eq(timeSlots.eventId, events.id))
        .where(inArray(slotBookings.id, b2bBookingIds));

      // Get partner names
      for (const row of b2bBookingsRaw) {
        const partnerUserId = b2bPartnerMap.get(row.booking.id);
        let partnerName = 'Unknown';
        if (partnerUserId) {
          const partnerResult = await db
            .select()
            .from(users)
            .where(eq(users.id, partnerUserId))
            .limit(1);
          if (partnerResult[0]) {
            partnerName = partnerResult[0].displayName || partnerResult[0].username || 'Unknown';
          }
        }
        b2bPartnerBookings.push({
          ...row,
          isB2BPartner: true,
          b2bPartnerName: partnerName,
        });
      }
    }

    // Combine own bookings and B2B partner bookings
    const bookings: BookingWithSlot[] = [
      ...ownBookings.map(b => ({ ...b, isB2BPartner: false })),
      ...b2bPartnerBookings,
    ];

    // Group consecutive slots by event and status
    const groupedBookings = groupConsecutiveSlots(bookings);

    // Filter out cancelled bookings that are older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const filteredBookings = groupedBookings.filter(group => {
      if (group.status === 'cancelled') {
        return group.updatedAt > oneHourAgo;
      }
      return true;
    });

    const bookingsWithB2B = await Promise.all(
      filteredBookings.map(async (group) => {
        // Use the first booking ID for B2B lookups (B2B is per-slot)
        const primaryBookingId = group.bookingIds[0];
        
        // If this is a B2B partner booking, we already have the partner name
        if (group.isB2BPartner && group.b2bPartnerName) {
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
            b2bPartner: group.b2bPartnerName,
            hasPendingB2B: false,
            isB2BPartner: true,
          };
        }
        
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
          isB2BPartner: false,
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

  // Sort by event, isB2BPartner, status, and slot index
  const sorted = [...bookings].sort((a, b) => {
    if (a.event.id !== b.event.id) return a.event.id.localeCompare(b.event.id);
    // Keep B2B partner bookings separate from own bookings
    if ((a.isB2BPartner ? 1 : 0) !== (b.isB2BPartner ? 1 : 0)) {
      return (a.isB2BPartner ? 1 : 0) - (b.isB2BPartner ? 1 : 0);
    }
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
    updatedAt: Date;
    isB2BPartner: boolean;
    b2bPartnerName?: string;
  }[] = [];

  for (const row of sorted) {
    const lastGroup = groups[groups.length - 1];
    
    // Check if this slot is consecutive with the last group
    // Also ensure B2B partner bookings stay separate
    const isConsecutive = lastGroup &&
      lastGroup.eventId === row.event.id &&
      lastGroup.status === row.booking.status &&
      lastGroup.isB2BPartner === (row.isB2BPartner || false) &&
      row.slot.slotIndex === lastGroup.lastSlotIndex + 1;

    if (isConsecutive) {
      // Extend the existing group
      lastGroup.bookingIds.push(row.booking.id);
      lastGroup.slotEndTime = row.slot.endTime;
      lastGroup.slotCount++;
      lastGroup.lastSlotIndex = row.slot.slotIndex;
      // Keep the most recent updatedAt
      if (row.booking.updatedAt > lastGroup.updatedAt) {
        lastGroup.updatedAt = row.booking.updatedAt;
      }
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
        updatedAt: row.booking.updatedAt,
        isB2BPartner: row.isB2BPartner || false,
        b2bPartnerName: row.b2bPartnerName,
      });
    }
  }

  return groups;
}
