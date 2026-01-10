import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db } from './drizzle';
import {
  events,
  timeSlots,
  EventStatus,
  SlotDuration,
  BookingType,
  SLOT_DURATIONS,
  EVENT_STATUSES,
} from './schema';

// TypeScript interfaces
export interface Event {
  id: string;
  hostId: string;
  title: string;
  description: string | null;
  bookingType: BookingType;
  slotDurationMinutes: SlotDuration;
  allowConsecutiveSlots: boolean;
  maxConsecutiveSlots: number;
  allowB2B: boolean;
  eventDate: Date;
  startTime: Date;
  endTime: Date;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id: string;
  eventId: string;
  startTime: Date;
  endTime: Date;
  slotIndex: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventInput {
  hostId: string;
  title: string;
  description?: string;
  bookingType?: BookingType;
  slotDurationMinutes?: SlotDuration;
  allowConsecutiveSlots?: boolean;
  maxConsecutiveSlots?: number;
  allowB2B?: boolean;
  eventDate: Date;
  startTime: Date;
  endTime: Date;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  bookingType?: BookingType;
  slotDurationMinutes?: SlotDuration;
  allowConsecutiveSlots?: boolean;
  maxConsecutiveSlots?: number;
  allowB2B?: boolean;
  eventDate?: Date;
  startTime?: Date;
  endTime?: Date;
  status?: EventStatus;
}

/**
 * Generate time slots for an event based on its configuration
 */
export function generateTimeSlots(
  eventId: string,
  startTime: Date,
  endTime: Date,
  slotDurationMinutes: number
): Omit<TimeSlot, 'createdAt' | 'updatedAt'>[] {
  const slots: Omit<TimeSlot, 'createdAt' | 'updatedAt'>[] = [];
  const durationMs = slotDurationMinutes * 60 * 1000;
  
  let currentStart = new Date(startTime);
  let slotIndex = 0;
  
  while (currentStart.getTime() + durationMs <= endTime.getTime()) {
    const slotEnd = new Date(currentStart.getTime() + durationMs);
    
    slots.push({
      id: uuidv4(),
      eventId,
      startTime: new Date(currentStart),
      endTime: slotEnd,
      slotIndex,
      status: 'available',
    });
    
    currentStart = slotEnd;
    slotIndex++;
  }
  
  return slots;
}

/**
 * Create a new event
 */
export async function createEvent(input: CreateEventInput): Promise<Event> {
  const id = uuidv4();
  const now = new Date();
  
  // Validate slot duration
  const slotDuration = input.slotDurationMinutes ?? 20;
  if (!SLOT_DURATIONS.includes(slotDuration as SlotDuration)) {
    throw new Error(`Invalid slot duration. Must be one of: ${SLOT_DURATIONS.join(', ')}`);
  }
  
  // Validate time range
  if (input.startTime >= input.endTime) {
    throw new Error('Start time must be before end time');
  }
  
  const eventData = {
    id,
    hostId: input.hostId,
    title: input.title,
    description: input.description ?? null,
    bookingType: input.bookingType ?? 'open_decks',
    slotDurationMinutes: slotDuration,
    allowConsecutiveSlots: input.allowConsecutiveSlots ?? false,
    maxConsecutiveSlots: input.maxConsecutiveSlots ?? 1,
    allowB2B: input.allowB2B ?? true,
    eventDate: input.eventDate,
    startTime: input.startTime,
    endTime: input.endTime,
    status: 'draft' as EventStatus,
    createdAt: now,
    updatedAt: now,
  };
  
  await db.insert(events).values(eventData);
  
  return eventData;
}

/**
 * Get an event by ID
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  const results = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    hostId: row.hostId,
    title: row.title,
    description: row.description,
    bookingType: row.bookingType as BookingType,
    slotDurationMinutes: row.slotDurationMinutes as SlotDuration,
    allowConsecutiveSlots: row.allowConsecutiveSlots,
    maxConsecutiveSlots: row.maxConsecutiveSlots,
    allowB2B: row.allowB2B,
    eventDate: row.eventDate,
    startTime: row.startTime,
    endTime: row.endTime,
    status: row.status as EventStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Get all events by host ID
 */
export async function getEventsByHostId(hostId: string): Promise<Event[]> {
  const results = await db
    .select()
    .from(events)
    .where(eq(events.hostId, hostId));
  
  return results.map((row) => ({
    id: row.id,
    hostId: row.hostId,
    title: row.title,
    description: row.description,
    bookingType: row.bookingType as BookingType,
    slotDurationMinutes: row.slotDurationMinutes as SlotDuration,
    allowConsecutiveSlots: row.allowConsecutiveSlots,
    maxConsecutiveSlots: row.maxConsecutiveSlots,
    allowB2B: row.allowB2B,
    eventDate: row.eventDate,
    startTime: row.startTime,
    endTime: row.endTime,
    status: row.status as EventStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

/**
 * Update an event
 */
export async function updateEvent(
  eventId: string,
  input: UpdateEventInput
): Promise<Event | null> {
  const existing = await getEventById(eventId);
  if (!existing) return null;
  
  const now = new Date();
  const updateData: Record<string, unknown> = { updatedAt: now };
  
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.bookingType !== undefined) updateData.bookingType = input.bookingType;
  if (input.slotDurationMinutes !== undefined) {
    if (!SLOT_DURATIONS.includes(input.slotDurationMinutes)) {
      throw new Error(`Invalid slot duration. Must be one of: ${SLOT_DURATIONS.join(', ')}`);
    }
    updateData.slotDurationMinutes = input.slotDurationMinutes;
  }
  if (input.allowConsecutiveSlots !== undefined) updateData.allowConsecutiveSlots = input.allowConsecutiveSlots;
  if (input.maxConsecutiveSlots !== undefined) updateData.maxConsecutiveSlots = input.maxConsecutiveSlots;
  if (input.allowB2B !== undefined) updateData.allowB2B = input.allowB2B;
  if (input.eventDate !== undefined) updateData.eventDate = input.eventDate;
  if (input.startTime !== undefined) updateData.startTime = input.startTime;
  if (input.endTime !== undefined) updateData.endTime = input.endTime;
  if (input.status !== undefined) {
    if (!EVENT_STATUSES.includes(input.status)) {
      throw new Error(`Invalid status. Must be one of: ${EVENT_STATUSES.join(', ')}`);
    }
    updateData.status = input.status;
  }
  
  // Validate time range if both are being updated
  const newStartTime = input.startTime ?? existing.startTime;
  const newEndTime = input.endTime ?? existing.endTime;
  if (newStartTime >= newEndTime) {
    throw new Error('Start time must be before end time');
  }
  
  await db
    .update(events)
    .set(updateData)
    .where(eq(events.id, eventId));
  
  return getEventById(eventId);
}

/**
 * Delete an event and its associated time slots
 */
export async function deleteEvent(eventId: string): Promise<boolean> {
  const existing = await getEventById(eventId);
  if (!existing) return false;
  
  // Delete associated time slots first
  await db.delete(timeSlots).where(eq(timeSlots.eventId, eventId));
  
  // Delete the event
  await db.delete(events).where(eq(events.id, eventId));
  
  return true;
}

/**
 * Publish an event and generate time slots
 */
export async function publishEvent(eventId: string): Promise<Event | null> {
  const event = await getEventById(eventId);
  if (!event) return null;
  
  if (event.status !== 'draft') {
    throw new Error('Only draft events can be published');
  }
  
  // Generate time slots
  const slots = generateTimeSlots(
    eventId,
    event.startTime,
    event.endTime,
    event.slotDurationMinutes
  );
  
  if (slots.length === 0) {
    throw new Error('Event duration is too short for the configured slot duration');
  }
  
  const now = new Date();
  
  // Insert all time slots
  await db.insert(timeSlots).values(
    slots.map((slot) => ({
      ...slot,
      createdAt: now,
      updatedAt: now,
    }))
  );
  
  // Update event status to published
  await db
    .update(events)
    .set({ status: 'published', updatedAt: now })
    .where(eq(events.id, eventId));
  
  return getEventById(eventId);
}

/**
 * Get time slots for an event
 */
export async function getEventTimeSlots(eventId: string): Promise<TimeSlot[]> {
  const results = await db
    .select()
    .from(timeSlots)
    .where(eq(timeSlots.eventId, eventId));
  
  return results
    .map((row) => ({
      id: row.id,
      eventId: row.eventId,
      startTime: row.startTime,
      endTime: row.endTime,
      slotIndex: row.slotIndex,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
    .sort((a, b) => a.slotIndex - b.slotIndex);
}

/**
 * Get a time slot by ID
 */
export async function getTimeSlotById(slotId: string): Promise<TimeSlot | null> {
  const results = await db
    .select()
    .from(timeSlots)
    .where(eq(timeSlots.id, slotId))
    .limit(1);
  
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    eventId: row.eventId,
    startTime: row.startTime,
    endTime: row.endTime,
    slotIndex: row.slotIndex,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Update a time slot's status
 */
export async function updateTimeSlotStatus(
  slotId: string,
  status: string
): Promise<TimeSlot | null> {
  const existing = await getTimeSlotById(slotId);
  if (!existing) return null;
  
  const now = new Date();
  
  await db
    .update(timeSlots)
    .set({ status, updatedAt: now })
    .where(eq(timeSlots.id, slotId));
  
  return getTimeSlotById(slotId);
}

/**
 * Get an event with its time slots
 */
export async function getEventWithSlots(eventId: string): Promise<{
  event: Event;
  slots: TimeSlot[];
} | null> {
  const event = await getEventById(eventId);
  if (!event) return null;
  
  const slots = await getEventTimeSlots(eventId);
  
  return { event, slots };
}
