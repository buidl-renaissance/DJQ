import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';
import { events, timeSlots, users } from '@/db/schema';
import { createEvent, publishEvent } from '@/db/events';
import { eq, inArray } from 'drizzle-orm';

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
            location: event.location,
            imageUrl: event.imageUrl,
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
        username,
        title,
        description,
        location,
        imageUrl,
        eventDate,
        startTime,
        endTime,
        slotDurationMinutes,
        allowConsecutiveSlots,
        maxConsecutiveSlots,
        allowB2B,
        publish,
      } = req.body;

      if (!username) {
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

      const user = userResults[0];

      // Check if user is active
      if (user.status === 'inactive') {
        return res.status(403).json({ error: 'Your account is deactivated. Please reactivate your account to create events.' });
      }
      if (user.status === 'banned') {
        return res.status(403).json({ error: 'Your account has been banned.' });
      }

      const hostId = user.id;

      const event = await createEvent({
        hostId,
        title,
        description,
        location,
        imageUrl,
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
