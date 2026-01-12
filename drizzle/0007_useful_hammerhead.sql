ALTER TABLE `users` ADD `pinHash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `failedPinAttempts` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lockedAt` integer;