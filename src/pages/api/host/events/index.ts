import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';
import { events, timeSlots } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    // Get all events hosted by this user
    const hostEvents = await db
      .select()
      .from(events)
      .where(eq(events.hostId, userId));

    const eventsWithStats = await Promise.all(
      hostEvents.map(async (event) => {
        const slots = await db
          .select()
          .from(timeSlots)
          .where(eq(timeSlots.eventId, event.id));

        const bookedSlots = slots.filter((s) => s.status === 'booked').length;

        return {
          id: event.id,
          title: event.title,
          eventDate: event.eventDate,
          startTime: event.startTime,
          endTime: event.endTime,
          slotDurationMinutes: event.slotDurationMinutes,
          status: event.status,
          totalSlots: slots.length,
          bookedSlots,
        };
      })
    );

    return res.status(200).json({ events: eventsWithStats });
  } catch (error) {
    console.error('Failed to fetch host events:', error);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
}
