ALTER TABLE `submission_analyses` ADD `auto_publish` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `submissions` ADD `auto_published_at` integer;