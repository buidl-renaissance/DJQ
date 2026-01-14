import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  fid: text('fid').unique(), // Optional - only for Farcaster users
  phone: text('phone').unique(), // For direct registration/login
  email: text('email'), // Optional
  username: text('username'),
  name: text('name'), // Synced from Farcaster/Renaissance
  pfpUrl: text('pfpUrl'), // Synced from Farcaster/Renaissance
  displayName: text('displayName'), // App-specific name (editable)
  profilePicture: text('profilePicture'), // App-specific profile picture (editable)
  accountAddress: text('accountAddress'), // Wallet address from Renaissance auth
  pinHash: text('pinHash'), // bcrypt hash of 4-digit PIN (nullable for existing/miniapp users)
  failedPinAttempts: integer('failedPinAttempts').default(0), // Failed PIN attempts counter (default 0)
  lockedAt: integer('lockedAt', { mode: 'timestamp' }), // Timestamp when account was locked (null = not locked)
  status: text('status').default('active'), // User status: active, inactive, banned (null treated as active)
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Farcaster Accounts table
export const farcasterAccounts = sqliteTable('farcaster_accounts', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  fid: text('fid').notNull().unique(),
  username: text('username').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// User status enum values
export const USER_STATUSES = ['active', 'inactive', 'banned'] as const;
export type UserStatus = typeof USER_STATUSES[number];

// Booking type enum values
export const BOOKING_TYPES = ['open_decks'] as const;
export type BookingType = typeof BOOKING_TYPES[number];

// Slot duration options in minutes
export const SLOT_DURATIONS = [20, 30, 60] as const;
export type SlotDuration = typeof SLOT_DURATIONS[number];

// Event status enum values
export const EVENT_STATUSES = ['draft', 'published', 'active', 'completed', 'cancelled'] as const;
export type EventStatus = typeof EVENT_STATUSES[number];

// Time slot status enum values
export const SLOT_STATUSES = ['available', 'booked', 'in_progress', 'completed'] as const;
export type SlotStatus = typeof SLOT_STATUSES[number];

// Booking status enum values
export const BOOKING_STATUSES = ['confirmed', 'cancelled'] as const;
export type BookingStatus = typeof BOOKING_STATUSES[number];

// B2B request status enum values
export const B2B_REQUEST_STATUSES = ['pending', 'accepted', 'declined', 'cancelled'] as const;
export type B2BRequestStatus = typeof B2B_REQUEST_STATUSES[number];

// B2B initiator type
export const B2B_INITIATORS = ['booker', 'requester'] as const;
export type B2BInitiator = typeof B2B_INITIATORS[number];

// Events table - Event configuration and metadata
export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  hostId: text('hostId').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('imageUrl'), // Event cover image
  bookingType: text('bookingType').notNull().default('open_decks'),
  slotDurationMinutes: integer('slotDurationMinutes').notNull().default(20),
  allowConsecutiveSlots: integer('allowConsecutiveSlots', { mode: 'boolean' }).notNull().default(false),
  maxConsecutiveSlots: integer('maxConsecutiveSlots').notNull().default(1),
  allowB2B: integer('allowB2B', { mode: 'boolean' }).notNull().default(true),
  eventDate: integer('eventDate', { mode: 'timestamp' }).notNull(),
  startTime: integer('startTime', { mode: 'timestamp' }).notNull(),
  endTime: integer('endTime', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull().default('draft'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Time Slots table - Auto-generated slots based on event duration settings
export const timeSlots = sqliteTable('time_slots', {
  id: text('id').primaryKey(),
  eventId: text('eventId').notNull().references(() => events.id),
  startTime: integer('startTime', { mode: 'timestamp' }).notNull(),
  endTime: integer('endTime', { mode: 'timestamp' }).notNull(),
  slotIndex: integer('slotIndex').notNull(),
  status: text('status').notNull().default('available'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Slot Bookings table - DJ bookings for slots
export const slotBookings = sqliteTable('slot_bookings', {
  id: text('id').primaryKey(),
  slotId: text('slotId').notNull().references(() => timeSlots.id),
  djId: text('djId').notNull().references(() => users.id),
  status: text('status').notNull().default('confirmed'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// B2B Requests table - B2B partnership requests
export const b2bRequests = sqliteTable('b2b_requests', {
  id: text('id').primaryKey(),
  bookingId: text('bookingId').notNull().references(() => slotBookings.id),
  requesterId: text('requesterId').notNull().references(() => users.id),
  requesteeId: text('requesteeId').notNull().references(() => users.id),
  initiatedBy: text('initiatedBy').notNull(), // 'booker' or 'requester'
  status: text('status').notNull().default('pending'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});
