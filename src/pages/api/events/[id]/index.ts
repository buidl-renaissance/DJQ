import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';
import { timeSlots, slotBookings, users, b2bRequests } from '@/db/schema';
import { getEventById } from '@/db/events';
import { eq, and } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  if (req.method === 'GET') {
    try {
      const event = await getEventById(id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Get all slots with booking info
      const slots = await db
        .select()
        .from(timeSlots)
        .where(eq(timeSlots.eventId, id));

      const slotsWithBookings = await Promise.all(
        slots.map(async (slot) => {
          const bookingResults = await db
            .select({
              booking: slotBookings,
              dj: users,
            })
            .from(slotBookings)
            .leftJoin(users, eq(slotBookings.djId, users.id))
            .where(
              and(
                eq(slotBookings.slotId, slot.id),
                eq(slotBookings.status, 'confirmed')
              )
            )
            .limit(1);

          const booking = bookingResults[0];
          
          let b2bPartnerName: string | undefined;
          if (booking) {
            const b2bResult = await db
              .select({
                request: b2bRequests,
                requester: users,
              })
              .from(b2bRequests)
              .leftJoin(users, eq(b2bRequests.requesterId, users.id))
              .where(
                and(
                  eq(b2bRequests.bookingId, booking.booking.id),
                  eq(b2bRequests.status, 'accepted')
                )
              )
              .limit(1);

            if (b2bResult[0]) {
              // Get the partner name (whoever isn't the original booker)
              const partnerUserId = b2bResult[0].request.requesterId === booking.booking.djId
                ? b2bResult[0].request.requesteeId
                : b2bResult[0].request.requesterId;
              
              const partnerResult = await db
                .select()
                .from(users)
                .where(eq(users.id, partnerUserId))
                .limit(1);
              
              if (partnerResult[0]) {
                b2bPartnerName = partnerResult[0].displayName || partnerResult[0].username || 'Unknown';
              }
            }
          }

          return {
            id: slot.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            slotIndex: slot.slotIndex,
            status: slot.status,
            booking: booking ? {
              id: booking.booking.id,
              djId: booking.booking.djId,
              djName: booking.dj?.displayName || booking.dj?.username || 'Unknown DJ',
              b2bPartner: b2bPartnerName,
            } : undefined,
          };
        })
      );

      return res.status(200).json({
        event,
        slots: slotsWithBookings.sort((a, b) => a.slotIndex - b.slotIndex),
      });
    } catch (error) {
      console.error('Failed to fetch event:', error);
      return res.status(500).json({ error: 'Failed to fetch event' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
