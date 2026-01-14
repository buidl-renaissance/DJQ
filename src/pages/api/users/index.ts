import type { NextApiRequest, NextApiResponse } from 'next';
import { eq, or, isNull } from 'drizzle-orm';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all active users for B2B search (null status treated as active)
    // In production, this should have pagination and search filters
    const allUsers = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        username: users.username,
      })
      .from(users)
      .where(or(eq(users.status, 'active'), isNull(users.status)))
      .limit(100);

    const formattedUsers = allUsers.map((user) => ({
      id: user.id,
      displayName: user.displayName || user.username || 'Unknown',
      username: user.username || 'unknown',
    }));

    return res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}
