ALTER TABLE `course` DROP FOREIGN KEY `course_userId_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `semester` DROP FOREIGN KEY `semester_userId_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `course` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `semester` DROP COLUMN `userId`;