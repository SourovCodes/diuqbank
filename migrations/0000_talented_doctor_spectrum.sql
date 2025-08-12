CREATE TABLE `account` (
	`userId` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`refresh_token` varchar(255),
	`access_token` varchar(255),
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` varchar(2048),
	`session_state` varchar(255),
	CONSTRAINT `account_provider_providerAccountId_pk` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `contactFormSubmission` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`message` varchar(2000) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contactFormSubmission_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	CONSTRAINT `course_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `department` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`shortName` varchar(50) NOT NULL,
	CONSTRAINT `department_id` PRIMARY KEY(`id`),
	CONSTRAINT `department_name_unique` UNIQUE(`name`),
	CONSTRAINT `department_shortName_unique` UNIQUE(`shortName`)
);
--> statement-breakpoint
CREATE TABLE `examType` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `examType_id` PRIMARY KEY(`id`),
	CONSTRAINT `examType_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `question` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`departmentId` int NOT NULL,
	`courseId` int NOT NULL,
	`semesterId` int NOT NULL,
	`examTypeId` int NOT NULL,
	`status` enum('published','duplicate','pending review','rejected') NOT NULL DEFAULT 'pending review',
	`pdfKey` varchar(255) NOT NULL,
	`pdfFileSizeInBytes` int NOT NULL,
	`viewCount` int NOT NULL DEFAULT 0,
	`isReviewed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `question_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`userId` varchar(255) NOT NULL,
	`content` varchar(1000) NOT NULL,
	`status` enum('pending review','resolved') NOT NULL DEFAULT 'pending review',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `semester` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	CONSTRAINT `semester_id` PRIMARY KEY(`id`),
	CONSTRAINT `semester_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `session_sessionToken` PRIMARY KEY(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255),
	`emailVerified` timestamp(3),
	`image` varchar(255),
	`username` varchar(100),
	`studentId` varchar(50),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `verificationToken_identifier_token_pk` PRIMARY KEY(`identifier`,`token`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course` ADD CONSTRAINT `course_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question` ADD CONSTRAINT `question_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question` ADD CONSTRAINT `question_departmentId_department_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question` ADD CONSTRAINT `question_courseId_course_id_fk` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question` ADD CONSTRAINT `question_semesterId_semester_id_fk` FOREIGN KEY (`semesterId`) REFERENCES `semester`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question` ADD CONSTRAINT `question_examTypeId_examType_id_fk` FOREIGN KEY (`examTypeId`) REFERENCES `examType`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `report` ADD CONSTRAINT `report_questionId_question_id_fk` FOREIGN KEY (`questionId`) REFERENCES `question`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `report` ADD CONSTRAINT `report_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `semester` ADD CONSTRAINT `semester_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;