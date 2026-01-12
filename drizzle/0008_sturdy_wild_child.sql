DROP INDEX "farcaster_accounts_fid_unique";--> statement-breakpoint
DROP INDEX "users_fid_unique";--> statement-breakpoint
DROP INDEX "users_phone_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "failedPinAttempts" TO "failedPinAttempts" integer;--> statement-breakpoint
CREATE UNIQUE INDEX `farcaster_accounts_fid_unique` ON `farcaster_accounts` (`fid`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_fid_unique` ON `users` (`fid`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);