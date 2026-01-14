import type { NextApiRequest, NextApiResponse } from 'next';
import { bookSlots } from '@/db/bookings';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
    const { slotIds, username } = req.body;

    if (!Array.isArray(slotIds) || slotIds.length === 0) {
      return res.status(400).json({ error: 'No slots provided' });
    }

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

    // Check if user is active (null status is treated as active)
    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Your account is deactivated. Please reactivate your account to make bookings.' });
    }
    if (user.status === 'banned') {
      return res.status(403).json({ error: 'Your account has been banned.' });
    }

    const djId = user.id;
    const bookings = await bookSlots({ slotIds, djId });

    return res.status(201).json({ bookings });
  } catch (error) {
    console.error('Failed to book slots:', error);
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to book slots' 
    });
  }
}
