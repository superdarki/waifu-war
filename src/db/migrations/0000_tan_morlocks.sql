CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`color` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text,
	`category` text,
	`data` text
);
