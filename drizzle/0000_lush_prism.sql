CREATE TABLE `b2b_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`bookingId` text NOT NULL,
	`requesterId` text NOT NULL,
	`requesteeId` text NOT NULL,
	`initiatedBy` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`bookingId`) REFERENCES `slot_bookings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`requesterId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`requesteeId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`hostId` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`bookingType` text DEFAULT 'open_decks' NOT NULL,
	`slotDurationMinutes` integer DEFAULT 20 NOT NULL,
	`allowConsecutiveSlots` integer DEFAULT false NOT NULL,
	`maxConsecutiveSlots` integer DEFAULT 1 NOT NULL,
	`allowB2B` integer DEFAULT true NOT NULL,
	`eventDate` integer NOT NULL,
	`startTime` integer NOT NULL,
	`endTime` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`hostId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `farcaster_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`fid` text NOT NULL,
	`username` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `farcaster_accounts_fid_unique` ON `farcaster_accounts` (`fid`);--> statement-breakpoint
CREATE TABLE `slot_bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`slotId` text NOT NULL,
	`djId` text NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`slotId`) REFERENCES `time_slots`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`djId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `time_slots` (
	`id` text PRIMARY KEY NOT NULL,
	`eventId` text NOT NULL,
	`startTime` integer NOT NULL,
	`endTime` integer NOT NULL,
	`slotIndex` integer NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`fid` text NOT NULL,
	`username` text,
	`displayName` text,
	`pfpUrl` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_fid_unique` ON `users` (`fid`);