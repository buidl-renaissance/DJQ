import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';
import { users, slotBookings, events } from '@/db/schema';
import { getUserById } from '@/db/user';
import { eq, desc } from 'drizzle-orm';

// Admin username (only this user can access admin functions)
const ADMIN_USERNAME = 'WiredInSamurai';

// Helper to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user || !user.username) return false;
  return user.username === ADMIN_USERNAME;
}

// Helper to get userId from session cookie
function getUserIdFromCookie(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie || '';
  const sessionMatch = cookies.match(/user_session=([^;]+)/);
  return sessionMatch ? sessionMatch[1] : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get current user from session
  const userId = getUserIdFromCookie(req);
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check if user is admin
  const adminCheck = await isAdmin(userId);
  if (!adminCheck) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  if (req.method === 'GET') {
    try {
      // Get all users with counts
      const allUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));

      const usersWithStats = await Promise.all(
        allUsers.map(async (user) => {
          // Count bookings
          const bookings = await db
            .select()
            .from(slotBookings)
            .where(eq(slotBookings.djId, user.id));

          // Count events hosted
          const hostedEvents = await db
            .select()
            .from(events)
            .where(eq(events.hostId, user.id));

          return {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            phone: user.phone,
            email: user.email,
            accountAddress: user.accountAddress,
            fid: user.fid,
            createdAt: user.createdAt,
            bookingsCount: bookings.length,
            eventsCount: hostedEvents.length,
            lockedAt: user.lockedAt,
            failedPinAttempts: user.failedPinAttempts,
            hasPin: !!user.pinHash,
            status: user.status,
          };
        })
      );

      return res.status(200).json({ users: usersWithStats });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
