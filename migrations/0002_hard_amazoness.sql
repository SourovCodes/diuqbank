CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`department_id` int NOT NULL,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_course_name_per_department` UNIQUE(`department_id`,`name`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`short_name` varchar(5) NOT NULL,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_name_unique` UNIQUE(`name`),
	CONSTRAINT `departments_short_name_unique` UNIQUE(`short_name`)
);
--> statement-breakpoint
ALTER TABLE `exam_types` ADD `order` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `semesters` ADD `order` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_department_id_departments_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;