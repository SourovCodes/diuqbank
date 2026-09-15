PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` integer,
	`department_id` integer,
	`custom_department_name` text,
	`custom_department_short_name` text,
	`course_id` integer,
	`custom_course_name` text,
	`semester_id` integer,
	`custom_semester_name` text,
	`exam_type_id` integer,
	`status` text DEFAULT 'pending_review' NOT NULL,
	`file_key` text NOT NULL,
	`file_size` integer NOT NULL,
	`uploader_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exam_type_id`) REFERENCES `exam_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`uploader_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`course_id`,`department_id`) REFERENCES `courses`(`id`,`department_id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "submissions_classification_check" CHECK((
        question_id IS NOT NULL
        AND department_id IS NULL AND custom_department_name IS NULL AND custom_department_short_name IS NULL
        AND course_id IS NULL AND custom_course_name IS NULL
        AND semester_id IS NULL AND custom_semester_name IS NULL
        AND exam_type_id IS NULL
      ) OR (
        question_id IS NULL
        AND exam_type_id IS NOT NULL
        AND (department_id IS NULL) <> (custom_department_name IS NULL)
        AND (course_id IS NULL) <> (custom_course_name IS NULL)
        AND (semester_id IS NULL) <> (custom_semester_name IS NULL)
        AND (custom_department_short_name IS NULL OR custom_department_name IS NOT NULL)
        AND (course_id IS NULL OR department_id IS NOT NULL)
      ))
);
--> statement-breakpoint
-- Edited: drizzle-kit also selected the newly added columns, which don't exist in the old table
-- (SQLite then reads the quoted names as strings). Copy only the pre-existing columns.
INSERT INTO `__new_submissions`("id", "question_id", "status", "file_key", "file_size", "uploader_id", "created_at", "updated_at") SELECT "id", "question_id", "status", "file_key", "file_size", "uploader_id", "created_at", "updated_at" FROM `submissions`;--> statement-breakpoint
DROP TABLE `submissions`;--> statement-breakpoint
ALTER TABLE `__new_submissions` RENAME TO `submissions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `submissions_fileKey_unique` ON `submissions` (`file_key`);--> statement-breakpoint
CREATE INDEX `submissions_question_id_status_idx` ON `submissions` (`question_id`,`status`);--> statement-breakpoint
CREATE INDEX `submissions_uploader_id_idx` ON `submissions` (`uploader_id`);