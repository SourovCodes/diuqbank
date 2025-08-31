CREATE TABLE `exam_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(10) NOT NULL,
	CONSTRAINT `exam_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `exam_types_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `semesters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(10) NOT NULL,
	CONSTRAINT `semesters_id` PRIMARY KEY(`id`),
	CONSTRAINT `semesters_name_unique` UNIQUE(`name`)
);
