CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`department_id` int NOT NULL,
	`course_id` int NOT NULL,
	`semester_id` int NOT NULL,
	`exam_type_id` int NOT NULL,
	`status` enum('published','pending review','rejected','requires fix') NOT NULL DEFAULT 'pending review',
	`status_reason` text,
	`pdf_key` varchar(255) NOT NULL,
	`pdf_size` int NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_department_id_departments_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_semester_id_semesters_id_fk` FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_exam_type_id_exam_types_id_fk` FOREIGN KEY (`exam_type_id`) REFERENCES `exam_types`(`id`) ON DELETE no action ON UPDATE no action;