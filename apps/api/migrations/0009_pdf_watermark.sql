ALTER TABLE `submissions` ADD `watermarked_file_key` text;--> statement-breakpoint
ALTER TABLE `submissions` ADD `watermarked_file_size` integer;--> statement-breakpoint
ALTER TABLE `submissions` ADD `watermark_status` text;--> statement-breakpoint
ALTER TABLE `submissions` ADD `watermark_error` text;--> statement-breakpoint
CREATE UNIQUE INDEX `submissions_watermarkedFileKey_unique` ON `submissions` (`watermarked_file_key`);