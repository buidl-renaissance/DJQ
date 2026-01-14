import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';
import { users, slotBookings, b2bRequests, events, timeSlots, farcasterAccounts } from '@/db/schema';
import { getUserById, unlockUser, updateUserStatus, UserStatus } from '@/db/user';
import { eq, or, inArray } from 'drizzle-orm';

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
  const { id: targetUserId } = req.query;

  if (typeof targetUserId !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

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

  if (req.method === 'DELETE') {
    try {
      // Check if target user exists
      const targetUser = await getUserById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent deleting admin
      if (targetUser.username === ADMIN_USERNAME) {
        return res.status(400).json({ error: 'Cannot delete admin user' });
      }

      console.log(`🗑️ [ADMIN] Deleting user ${targetUserId} and related data...`);

      // Get all bookings by this user
      const userBookings = await db
        .select()
        .from(slotBookings)
        .where(eq(slotBookings.djId, targetUserId));

      const bookingIds = userBookings.map(b => b.id);

      // Delete B2B requests related to user's bookings
      if (bookingIds.length > 0) {
        await db
          .delete(b2bRequests)
          .where(inArray(b2bRequests.bookingId, bookingIds));
        console.log(`  - Deleted B2B requests for ${bookingIds.length} bookings`);
      }

      // Delete B2B requests where user is requester or requestee
      await db
        .delete(b2bRequests)
        .where(
          or(
            eq(b2bRequests.requesterId, targetUserId),
            eq(b2bRequests.requesteeId, targetUserId)
          )
        );
      console.log(`  - Deleted B2B requests involving user`);

      // Delete user's bookings
      await db
        .delete(slotBookings)
        .where(eq(slotBookings.djId, targetUserId));
      console.log(`  - Deleted ${userBookings.length} bookings`);

      // Get events hosted by user
      const userEvents = await db
        .select()
        .from(events)
        .where(eq(events.hostId, targetUserId));

      // Delete time slots and bookings for user's events
      for (const event of userEvents) {
        // Get slots for this event
        const eventSlots = await db
          .select()
          .from(timeSlots)
          .where(eq(timeSlots.eventId, event.id));

        const slotIds = eventSlots.map(s => s.id);

        if (slotIds.length > 0) {
          // Delete bookings for these slots
          const slotBookingsToDelete = await db
            .select()
            .from(slotBookings)
            .where(inArray(slotBookings.slotId, slotIds));

          const slotBookingIds = slotBookingsToDelete.map(b => b.id);

          // Delete B2B requests for these bookings
          if (slotBookingIds.length > 0) {
            await db
              .delete(b2bRequests)
              .where(inArray(b2bRequests.bookingId, slotBookingIds));
          }

          // Delete the bookings
          await db
            .delete(slotBookings)
            .where(inArray(slotBookings.slotId, slotIds));

          // Delete the slots
          await db
            .delete(timeSlots)
            .where(eq(timeSlots.eventId, event.id));
        }
      }
      console.log(`  - Deleted ${userEvents.length} events and their slots/bookings`);

      // Delete user's events
      await db
        .delete(events)
        .where(eq(events.hostId, targetUserId));

      // Delete Farcaster account link
      await db
        .delete(farcasterAccounts)
        .where(eq(farcasterAccounts.userId, targetUserId));
      console.log(`  - Deleted Farcaster account link`);

      // Finally, delete the user
      await db
        .delete(users)
        .where(eq(users.id, targetUserId));
      console.log(`  - Deleted user record`);

      console.log(`✅ [ADMIN] User ${targetUserId} deleted successfully`);

      return res.status(200).json({
        success: true,
        message: 'User and all related data deleted successfully',
        deletedUser: {
          id: targetUser.id,
          username: targetUser.username,
          displayName: targetUser.displayName,
        },
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  // PATCH - Admin actions (unlock, updateStatus)
  if (req.method === 'PATCH') {
    try {
      const { action, status } = req.body as { action?: string; status?: UserStatus };

      // Check if target user exists
      const targetUser = await getUserById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent modifying admin
      if (targetUser.username === ADMIN_USERNAME) {
        return res.status(400).json({ error: 'Cannot modify admin user' });
      }

      if (action === 'unlock') {
        // Check if user is actually locked
        if (!targetUser.lockedAt) {
          return res.status(400).json({ error: 'User account is not locked' });
        }

        // Unlock the user
        const unlockedUser = await unlockUser(targetUserId);

        if (!unlockedUser) {
          return res.status(500).json({ error: 'Failed to unlock user' });
        }

        console.log(`🔓 [ADMIN] User ${targetUserId} unlocked successfully`);

        return res.status(200).json({
          success: true,
          message: 'User account unlocked successfully',
          user: {
            id: unlockedUser.id,
            username: unlockedUser.username,
            displayName: unlockedUser.displayName,
            lockedAt: unlockedUser.lockedAt,
            failedPinAttempts: unlockedUser.failedPinAttempts,
          },
        });
      }

      if (action === 'updateStatus') {
        if (!status || !['active', 'inactive', 'banned'].includes(status)) {
          return res.status(400).json({ error: 'Invalid status. Must be "active", "inactive", or "banned".' });
        }

        const updatedUser = await updateUserStatus(targetUserId, status);

        if (!updatedUser) {
          return res.status(500).json({ error: 'Failed to update user status' });
        }

        console.log(`🔄 [ADMIN] User ${targetUserId} status updated to "${status}"`);

        return res.status(200).json({
          success: true,
          message: `User status updated to "${status}"`,
          user: {
            id: updatedUser.id,
            username: updatedUser.username,
            displayName: updatedUser.displayName,
            status: updatedUser.status,
          },
        });
      }

      return res.status(400).json({ error: 'Invalid action. Supported actions: "unlock", "updateStatus".' });
    } catch (error) {
      console.error('Error processing admin action:', error);
      return res.status(500).json({ error: 'Failed to process action' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
