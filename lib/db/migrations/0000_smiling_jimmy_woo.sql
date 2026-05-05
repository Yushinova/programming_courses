CREATE TABLE `categories` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`age_range` varchar(50) NOT NULL,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`level` varchar(20) NOT NULL,
	`duration` varchar(50) NOT NULL,
	`price` int NOT NULL,
	`currency` varchar(3) DEFAULT 'RUB',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`is_active` boolean NOT NULL DEFAULT true,
	`url` varchar(200) NOT NULL,
	`image_url` varchar(500),
	`category_id` int NOT NULL,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_url_unique` UNIQUE(`url`)
);
--> statement-breakpoint
CREATE TABLE `requirements` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`text` text NOT NULL,
	`course_id` int NOT NULL,
	CONSTRAINT `requirements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outcomes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`skill` varchar(200) NOT NULL,
	`level` varchar(20) NOT NULL,
	`course_id` int NOT NULL,
	CONSTRAINT `outcomes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `requirements` ADD CONSTRAINT `requirements_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `outcomes` ADD CONSTRAINT `outcomes_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;