import type { NextApiRequest, NextApiResponse } from 'next';
import { getEventById, publishEvent } from '@/db/events';

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
    // TODO: Get authenticated user ID from session
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify ownership
    if (event.hostId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const publishedEvent = await publishEvent(id);

    return res.status(200).json({ event: publishedEvent });
  } catch (error) {
    console.error('Failed to publish event:', error);
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to publish event' 
    });
  }
}
