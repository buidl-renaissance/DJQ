import { v4 as uuidv4 } from 'uuid';
import { eq, and, inArray } from 'drizzle-orm';
import { db } from './drizzle';
import {
  slotBookings,
  b2bRequests,
  timeSlots,
  BookingStatus,
  B2BRequestStatus,
  B2BInitiator,
} from './schema';
import { getTimeSlotById, getEventById, updateTimeSlotStatus } from './events';

// TypeScript interfaces
export interface SlotBooking {
  id: string;
  slotId: string;
  djId: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface B2BRequest {
  id: string;
  bookingId: string;
  requesterId: string;
  requesteeId: string;
  initiatedBy: B2BInitiator;
  status: B2BRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingInput {
  slotIds: string[];
  djId: string;
}

export interface CreateB2BRequestInput {
  bookingId: string;
  requesterId: string;
  requesteeId: string;
  initiatedBy: B2BInitiator;
}

/**
 * Validate that slots are consecutive and belong to the same event
 */
async function validateConsecutiveSlots(slotIds: string[]): Promise<{
  valid: boolean;
  eventId?: string;
  error?: string;
}> {
  if (slotIds.length === 0) {
    return { valid: false, error: 'No slots provided' };
  }

  // Get all slots
  const slots = await db
    .select()
    .from(timeSlots)
    .where(inArray(timeSlots.id, slotIds));

  if (slots.length !== slotIds.length) {
    return { valid: false, error: 'One or more slots not found' };
  }

  // Check all slots belong to the same event
  const eventIds = new Set(slots.map((s) => s.eventId));
  if (eventIds.size > 1) {
    return { valid: false, error: 'All slots must belong to the same event' };
  }

  const eventId = slots[0].eventId;

  // Check all slots are available
  const unavailableSlots = slots.filter((s) => s.status !== 'available');
  if (unavailableSlots.length > 0) {
    return { valid: false, error: 'One or more slots are not available' };
  }

  // If only one slot, no need to check consecutiveness
  if (slots.length === 1) {
    return { valid: true, eventId };
  }

  // Sort by slot index and check they are consecutive
  const sortedSlots = slots.sort((a, b) => a.slotIndex - b.slotIndex);
  for (let i = 1; i < sortedSlots.length; i++) {
    if (sortedSlots[i].slotIndex !== sortedSlots[i - 1].slotIndex + 1) {
      return { valid: false, error: 'Slots must be consecutive' };
    }
  }

  return { valid: true, eventId };
}

/**
 * Book one or more slots for a DJ
 */
export async function bookSlots(input: CreateBookingInput): Promise<SlotBooking[]> {
  const { slotIds, djId } = input;

  // Validate slots
  const validation = await validateConsecutiveSlots(slotIds);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const eventId = validation.eventId!;
  const event = await getEventById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  // Check if event allows consecutive slots
  if (slotIds.length > 1 && !event.allowConsecutiveSlots) {
    throw new Error('This event does not allow booking consecutive slots');
  }

  // Check max consecutive slots
  if (slotIds.length > event.maxConsecutiveSlots) {
    throw new Error(`Maximum ${event.maxConsecutiveSlots} consecutive slot(s) allowed`);
  }

  // Check event is in a bookable state
  if (event.status !== 'published' && event.status !== 'active') {
    throw new Error('Event is not open for bookings');
  }

  const now = new Date();
  const bookings: SlotBooking[] = [];

  // Create bookings for each slot
  for (const slotId of slotIds) {
    const bookingId = uuidv4();
    const booking = {
      id: bookingId,
      slotId,
      djId,
      status: 'confirmed' as BookingStatus,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(slotBookings).values(booking);
    
    // Update slot status to booked
    await updateTimeSlotStatus(slotId, 'booked');

    bookings.push(booking);
  }

  return bookings;
}

/**
 * Get a booking by ID
 */
export async function getBookingById(bookingId: string): Promise<SlotBooking | null> {
  const results = await db
    .select()
    .from(slotBookings)
    .where(eq(slotBookings.id, bookingId))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    slotId: row.slotId,
    djId: row.djId,
    status: row.status as BookingStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Get bookings by DJ ID
 */
export async function getBookingsByDjId(djId: string): Promise<SlotBooking[]> {
  const results = await db
    .select()
    .from(slotBookings)
    .where(eq(slotBookings.djId, djId));

  return results.map((row) => ({
    id: row.id,
    slotId: row.slotId,
    djId: row.djId,
    status: row.status as BookingStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

/**
 * Get booking by slot ID
 */
export async function getBookingBySlotId(slotId: string): Promise<SlotBooking | null> {
  const results = await db
    .select()
    .from(slotBookings)
    .where(and(
      eq(slotBookings.slotId, slotId),
      eq(slotBookings.status, 'confirmed')
    ))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    slotId: row.slotId,
    djId: row.djId,
    status: row.status as BookingStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string): Promise<SlotBooking | null> {
  const booking = await getBookingById(bookingId);
  if (!booking) return null;

  if (booking.status === 'cancelled') {
    throw new Error('Booking is already cancelled');
  }

  const now = new Date();

  // Update booking status
  await db
    .update(slotBookings)
    .set({ status: 'cancelled', updatedAt: now })
    .where(eq(slotBookings.id, bookingId));

  // Update slot status back to available
  await updateTimeSlotStatus(booking.slotId, 'available');

  // Cancel any pending B2B requests for this booking
  await db
    .update(b2bRequests)
    .set({ status: 'cancelled', updatedAt: now })
    .where(and(
      eq(b2bRequests.bookingId, bookingId),
      eq(b2bRequests.status, 'pending')
    ));

  return getBookingById(bookingId);
}

/**
 * Create a B2B request
 * - If initiatedBy is 'booker': the original booker (requesterId) invites another DJ (requesteeId)
 * - If initiatedBy is 'requester': a DJ (requesterId) requests to join an existing booking, requesteeId is the original booker
 */
export async function createB2BRequest(input: CreateB2BRequestInput): Promise<B2BRequest> {
  const { bookingId, requesterId, requesteeId, initiatedBy } = input;

  // Get the booking
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status !== 'confirmed') {
    throw new Error('Cannot create B2B request for a cancelled booking');
  }

  // Get the slot and event to check if B2B is allowed
  const slot = await getTimeSlotById(booking.slotId);
  if (!slot) {
    throw new Error('Slot not found');
  }

  const event = await getEventById(slot.eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  if (!event.allowB2B) {
    throw new Error('This event does not allow B2B bookings');
  }

  // Validate the request based on initiator
  if (initiatedBy === 'booker') {
    // The booker is inviting someone, so requesterId should be the booking's DJ
    if (requesterId !== booking.djId) {
      throw new Error('Only the original booker can invite for B2B');
    }
  } else {
    // Someone is requesting to join, so requesteeId should be the booking's DJ
    if (requesteeId !== booking.djId) {
      throw new Error('B2B requests must be sent to the slot booker');
    }
  }

  // Check for existing accepted B2B partners for this booking (max 2 partners = 3 total participants)
  const acceptedB2B = await db
    .select()
    .from(b2bRequests)
    .where(and(
      eq(b2bRequests.bookingId, bookingId),
      eq(b2bRequests.status, 'accepted')
    ));

  if (acceptedB2B.length >= 2) {
    throw new Error('This slot already has the maximum number of B2B partners (3 total participants)');
  }

  // Check if this user is already a B2B partner for this booking
  const targetUserId = initiatedBy === 'booker' ? requesteeId : requesterId;
  const existingPartnership = acceptedB2B.find(
    r => r.requesterId === targetUserId || r.requesteeId === targetUserId
  );
  if (existingPartnership) {
    throw new Error('This user is already a B2B partner for this booking');
  }

  // Check for existing pending request FROM or TO the same user
  const existingPendingForUser = await db
    .select()
    .from(b2bRequests)
    .where(and(
      eq(b2bRequests.bookingId, bookingId),
      eq(b2bRequests.status, 'pending'),
      eq(b2bRequests.requesteeId, targetUserId)
    ));

  if (existingPendingForUser.length > 0) {
    throw new Error('There is already a pending B2B request for this user');
  }

  const id = uuidv4();
  const now = new Date();

  const request = {
    id,
    bookingId,
    requesterId,
    requesteeId,
    initiatedBy,
    status: 'pending' as B2BRequestStatus,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(b2bRequests).values(request);

  return request;
}

/**
 * Get a B2B request by ID
 */
export async function getB2BRequestById(requestId: string): Promise<B2BRequest | null> {
  const results = await db
    .select()
    .from(b2bRequests)
    .where(eq(b2bRequests.id, requestId))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    bookingId: row.bookingId,
    requesterId: row.requesterId,
    requesteeId: row.requesteeId,
    initiatedBy: row.initiatedBy as B2BInitiator,
    status: row.status as B2BRequestStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Get pending B2B requests for a user (as requestee)
 */
export async function getPendingB2BRequestsForUser(userId: string): Promise<B2BRequest[]> {
  const results = await db
    .select()
    .from(b2bRequests)
    .where(and(
      eq(b2bRequests.requesteeId, userId),
      eq(b2bRequests.status, 'pending')
    ));

  return results.map((row) => ({
    id: row.id,
    bookingId: row.bookingId,
    requesterId: row.requesterId,
    requesteeId: row.requesteeId,
    initiatedBy: row.initiatedBy as B2BInitiator,
    status: row.status as B2BRequestStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

/**
 * Get B2B requests sent by a user
 */
export async function getB2BRequestsByRequesterId(requesterId: string): Promise<B2BRequest[]> {
  const results = await db
    .select()
    .from(b2bRequests)
    .where(eq(b2bRequests.requesterId, requesterId));

  return results.map((row) => ({
    id: row.id,
    bookingId: row.bookingId,
    requesterId: row.requesterId,
    requesteeId: row.requesteeId,
    initiatedBy: row.initiatedBy as B2BInitiator,
    status: row.status as B2BRequestStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

/**
 * Accept a B2B request
 */
export async function acceptB2BRequest(
  requestId: string,
  acceptingUserId: string
): Promise<B2BRequest | null> {
  const request = await getB2BRequestById(requestId);
  if (!request) return null;

  if (request.status !== 'pending') {
    throw new Error('B2B request is not pending');
  }

  // Only the requestee can accept
  if (request.requesteeId !== acceptingUserId) {
    throw new Error('Only the requestee can accept this B2B request');
  }

  const now = new Date();

  await db
    .update(b2bRequests)
    .set({ status: 'accepted', updatedAt: now })
    .where(eq(b2bRequests.id, requestId));

  return getB2BRequestById(requestId);
}

/**
 * Decline a B2B request
 */
export async function declineB2BRequest(
  requestId: string,
  decliningUserId: string
): Promise<B2BRequest | null> {
  const request = await getB2BRequestById(requestId);
  if (!request) return null;

  if (request.status !== 'pending') {
    throw new Error('B2B request is not pending');
  }

  // Only the requestee can decline
  if (request.requesteeId !== decliningUserId) {
    throw new Error('Only the requestee can decline this B2B request');
  }

  const now = new Date();

  await db
    .update(b2bRequests)
    .set({ status: 'declined', updatedAt: now })
    .where(eq(b2bRequests.id, requestId));

  return getB2BRequestById(requestId);
}

/**
 * Cancel a B2B request (by the requester)
 */
export async function cancelB2BRequest(
  requestId: string,
  cancellingUserId: string
): Promise<B2BRequest | null> {
  const request = await getB2BRequestById(requestId);
  if (!request) return null;

  if (request.status !== 'pending') {
    throw new Error('B2B request is not pending');
  }

  // Only the requester can cancel
  if (request.requesterId !== cancellingUserId) {
    throw new Error('Only the requester can cancel this B2B request');
  }

  const now = new Date();

  await db
    .update(b2bRequests)
    .set({ status: 'cancelled', updatedAt: now })
    .where(eq(b2bRequests.id, requestId));

  return getB2BRequestById(requestId);
}

/**
 * Leave an accepted B2B partnership (by either party)
 */
export async function leaveB2BPartnership(
  requestId: string,
  leavingUserId: string
): Promise<B2BRequest | null> {
  const request = await getB2BRequestById(requestId);
  if (!request) return null;

  if (request.status !== 'accepted') {
    throw new Error('B2B request is not accepted');
  }

  // Either the requester or requestee can leave
  if (request.requesterId !== leavingUserId && request.requesteeId !== leavingUserId) {
    throw new Error('Only participants can leave this B2B partnership');
  }

  const now = new Date();

  await db
    .update(b2bRequests)
    .set({ status: 'cancelled', updatedAt: now })
    .where(eq(b2bRequests.id, requestId));

  return getB2BRequestById(requestId);
}

/**
 * Get B2B partner for a booking (if accepted)
 */
export async function getB2BPartnerForBooking(bookingId: string): Promise<string | null> {
  const results = await db
    .select()
    .from(b2bRequests)
    .where(and(
      eq(b2bRequests.bookingId, bookingId),
      eq(b2bRequests.status, 'accepted')
    ))
    .limit(1);

  if (results.length === 0) return null;

  const request = results[0];
  // Return the partner (the one who is not the original booker)
  const booking = await getBookingById(bookingId);
  if (!booking) return null;

  // The partner is whichever user in the request is NOT the original DJ
  if (request.requesterId === booking.djId) {
    return request.requesteeId;
  } else {
    return request.requesterId;
  }
}

/**
 * Get booking with B2B info
 */
export async function getBookingWithB2B(bookingId: string): Promise<{
  booking: SlotBooking;
  b2bPartner: string | null;
  pendingB2BRequest: B2BRequest | null;
} | null> {
  const booking = await getBookingById(bookingId);
  if (!booking) return null;

  const b2bPartner = await getB2BPartnerForBooking(bookingId);

  // Get pending request if any
  const pendingResults = await db
    .select()
    .from(b2bRequests)
    .where(and(
      eq(b2bRequests.bookingId, bookingId),
      eq(b2bRequests.status, 'pending')
    ))
    .limit(1);

  const pendingB2BRequest = pendingResults.length > 0
    ? {
        id: pendingResults[0].id,
        bookingId: pendingResults[0].bookingId,
        requesterId: pendingResults[0].requesterId,
        requesteeId: pendingResults[0].requesteeId,
        initiatedBy: pendingResults[0].initiatedBy as B2BInitiator,
        status: pendingResults[0].status as B2BRequestStatus,
        createdAt: pendingResults[0].createdAt,
        updatedAt: pendingResults[0].updatedAt,
      }
    : null;

  return {
    booking,
    b2bPartner,
    pendingB2BRequest,
  };
}
