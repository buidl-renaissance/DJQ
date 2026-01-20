import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { getEventById, updatePublishedEventId } from '@/db/events';
import { eq } from 'drizzle-orm';

const RENAISSANCE_EVENTS_API_URL = process.env.RENAISSANCE_EVENTS_API_URL || 'http://localhost:3002';
const DJQ_PUBLIC_URL = process.env.DJQ_PUBLIC_URL || process.env.NEXT_PUBLIC_BASE_URL || '';

/**
 * POST /api/events/[id]/publish-event
 * Publish or update an event to renaissance-events
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  try {
    // Get user from session cookie
    const sessionCookie = req.cookies.user_session;
    if (!sessionCookie) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get the user
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionCookie))
      .limit(1);

    if (userResults.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResults[0];

    // Get the event
    const event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the host of this event
    if (event.hostId !== user.id) {
      return res.status(403).json({ error: 'Not authorized to publish this event' });
    }

    // Get host info for the event metadata
    const hostInfo = {
      name: user.displayName || user.username || 'Unknown Host',
      username: user.username,
    };

    // Ensure endTime is after startTime (handle overnight events)
    let endTime = event.endTime;
    if (endTime <= event.startTime) {
      // End time is on the next day
      endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
    }

    // Build the event data to send to renaissance-events
    const eventData = {
      name: event.title,
      location: event.location || 'TBD',
      startTime: event.startTime.toISOString(),
      endTime: endTime.toISOString(),
      imageUrl: event.imageUrl || '',
      metadata: {
        description: event.description || `DJ event hosted by ${hostInfo.name}`,
        djqEventId: event.id,
        host: hostInfo,
        bookingType: event.bookingType,
        slotDurationMinutes: event.slotDurationMinutes,
        allowB2B: event.allowB2B,
        status: event.status,
      },
      tags: ['dj', 'music', 'open-decks'],
      eventType: 'renaissance',
      source: 'djq',
      sourceId: event.id,
      sourceUrl: DJQ_PUBLIC_URL ? `${DJQ_PUBLIC_URL}/events/${event.id}` : undefined,
    };

    let publishedEventId: number;

    if (event.publishedEventId) {
      // Update existing event
      const response = await fetch(`${RENAISSANCE_EVENTS_API_URL}/api/events/${event.publishedEventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update event' }));
        return res.status(response.status).json({ 
          error: errorData.error || 'Failed to update event in renaissance-events' 
        });
      }

      const updatedEvent = await response.json();
      publishedEventId = updatedEvent.id;
    } else {
      // Create new event
      const response = await fetch(`${RENAISSANCE_EVENTS_API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create event' }));
        return res.status(response.status).json({ 
          error: errorData.error || 'Failed to create event in renaissance-events' 
        });
      }

      const newEvent = await response.json();
      publishedEventId = newEvent.id;

      // Save the published event ID to the event
      await updatePublishedEventId(id, publishedEventId);
    }

    // Get the updated event
    const updatedEvent = await getEventById(id);

    return res.status(200).json({
      success: true,
      event: updatedEvent,
      publishedEventId,
      message: event.publishedEventId ? 'Event updated in renaissance-events' : 'Event published to renaissance-events',
    });
  } catch (error) {
    console.error('Error publishing event to renaissance-events:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
