import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';
import { events, timeSlots, slotBookings } from '@/db/schema';
import { createEvent, publishEvent } from '@/db/events';
import { eq, and, inArray } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Get all published/active events with slot counts
      const allEvents = await db
        .select()
        .from(events)
        .where(
          inArray(events.status, ['published', 'active'])
        );

      const eventsWithSlots = await Promise.all(
        allEvents.map(async (event) => {
          const slots = await db
            .select()
            .from(timeSlots)
            .where(eq(timeSlots.eventId, event.id));

          const availableSlots = slots.filter((s) => s.status === 'available').length;

          return {
            id: event.id,
            title: event.title,
            eventDate: event.eventDate,
            startTime: event.startTime,
            endTime: event.endTime,
            slotDurationMinutes: event.slotDurationMinutes,
            allowB2B: event.allowB2B,
            allowConsecutiveSlots: event.allowConsecutiveSlots,
            status: event.status,
            availableSlots,
            totalSlots: slots.length,
          };
        })
      );

      return res.status(200).json({ events: eventsWithSlots });
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        title,
        description,
        eventDate,
        startTime,
        endTime,
        slotDurationMinutes,
        allowConsecutiveSlots,
        maxConsecutiveSlots,
        allowB2B,
        publish,
      } = req.body;

      // TODO: Get authenticated user ID from session
      // For now, use a placeholder
      const hostId = req.headers['x-user-id'] as string || 'placeholder-user-id';

      const event = await createEvent({
        hostId,
        title,
        description,
        eventDate: new Date(eventDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        slotDurationMinutes,
        allowConsecutiveSlots,
        maxConsecutiveSlots,
        allowB2B,
      });

      let finalEvent = event;
      if (publish) {
        const published = await publishEvent(event.id);
        if (published) {
          finalEvent = published;
        }
      }

      return res.status(201).json({ event: finalEvent });
    } catch (error) {
      console.error('Failed to create event:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to create event' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
