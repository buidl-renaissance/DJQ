import type { NextApiRequest, NextApiResponse } from 'next';
import { bookSlots } from '@/db/bookings';

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
    const { slotIds } = req.body;

    if (!Array.isArray(slotIds) || slotIds.length === 0) {
      return res.status(400).json({ error: 'No slots provided' });
    }

    // TODO: Get authenticated user ID from session
    const djId = req.headers['x-user-id'] as string;
    if (!djId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const bookings = await bookSlots({ slotIds, djId });

    return res.status(201).json({ bookings });
  } catch (error) {
    console.error('Failed to book slots:', error);
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to book slots' 
    });
  }
}
