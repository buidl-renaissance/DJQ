import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';
import { events, timeSlots, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
