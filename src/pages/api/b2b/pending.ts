import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';
import { b2bRequests, slotBookings, timeSlots, events, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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

    // Get pending B2B requests where the user is the requestee
    const pendingRequests = await db
      .select({
        request: b2bRequests,
        booking: slotBookings,
        slot: timeSlots,
        event: events,
        requester: users,
      })
      .from(b2bRequests)
      .innerJoin(slotBookings, eq(b2bRequests.bookingId, slotBookings.id))
      .innerJoin(timeSlots, eq(slotBookings.slotId, timeSlots.id))
      .innerJoin(events, eq(timeSlots.eventId, events.id))
      .innerJoin(users, eq(b2bRequests.requesterId, users.id))
      .where(
        and(
          eq(b2bRequests.requesteeId, userId),
          eq(b2bRequests.status, 'pending')
        )
      );

    const formattedRequests = pendingRequests.map((row) => ({
      id: row.request.id,
      requesterName: row.requester.displayName || row.requester.name || row.requester.username || 'Unknown',
      requesterUsername: row.requester.username,
      requesterPfpUrl: row.requester.profilePicture || row.requester.pfpUrl || null,
      eventTitle: row.event.title,
      slotTime: `${new Date(row.slot.startTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })} - ${new Date(row.slot.endTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}`,
      initiatedBy: row.request.initiatedBy,
    }));

    return res.status(200).json({ requests: formattedRequests });
  } catch (error) {
    console.error('Failed to fetch B2B requests:', error);
    return res.status(500).json({ error: 'Failed to fetch B2B requests' });
  }
}
