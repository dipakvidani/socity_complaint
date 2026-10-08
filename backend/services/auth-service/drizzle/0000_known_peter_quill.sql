CREATE TABLE `scm_refresh_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scm_refresh_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scm_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`full_name` varchar(60) NOT NULL,
	`email` varchar(100) NOT NULL,
	`mobile` varchar(10) NOT NULL,
	`flat_number` varchar(12) NOT NULL,
	`password_hash` varchar(100) NOT NULL,
	`avatar_url` varchar(300),
	`role` enum('resident','admin') NOT NULL DEFAULT 'resident',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `scm_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `scm_users_email_unique` UNIQUE(`email`)
);
