CREATE TABLE `scm_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`complaint_id` int NOT NULL,
	`user_id` int NOT NULL,
	`author_name` varchar(60) NOT NULL,
	`author_role` enum('resident','admin') NOT NULL,
	`message` varchar(300) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `scm_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scm_complaints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`category` enum('plumbing','electrical','cleaning','security','parking','noise','other') NOT NULL,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('open','in_progress','resolved','cancelled') NOT NULL DEFAULT 'open',
	`image_url` varchar(300),
	`resident_id` int NOT NULL,
	`resident_name` varchar(60) NOT NULL,
	`flat_number` varchar(12) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `scm_complaints_id` PRIMARY KEY(`id`)
);
