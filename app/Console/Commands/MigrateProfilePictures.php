<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MigrateProfilePictures extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:migrate-profile-pictures';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate existing profile pictures from public disk to profile-pictures disk';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting profile pictures migration...');

        // Get all media items for profile_picture collection on public disk
        $mediaItems = Media::where('collection_name', 'profile_picture')
            ->where('disk', 'public')
            ->get();

        if ($mediaItems->isEmpty()) {
            $this->info('No profile pictures found to migrate.');

            return self::SUCCESS;
        }

        $this->info("Found {$mediaItems->count()} profile pictures to migrate.");

        $progressBar = $this->output->createProgressBar($mediaItems->count());
        $progressBar->start();

        $migrated = 0;
        $failed = 0;

        foreach ($mediaItems as $media) {
            try {
                $oldPath = $media->getPath();
                $newPath = storage_path('app/public/profile-pictures/').$media->id.'/'.$media->file_name;

                // Check if file exists on old disk
                if (! file_exists($oldPath)) {
                    $this->newLine();
                    $this->warn("File not found: {$oldPath}");
                    $failed++;
                    $progressBar->advance();

                    continue;
                }

                // Create directory if it doesn't exist (/{id}/ structure)
                $newDirectory = dirname($newPath);
                if (! file_exists($newDirectory)) {
                    mkdir($newDirectory, 0755, true);
                }

                // Copy file to new location
                if (copy($oldPath, $newPath)) {
                    // Update media record
                    $media->disk = 'profile-pictures';
                    $media->save();

                    // Delete old file
                    unlink($oldPath);

                    $migrated++;
                } else {
                    $this->newLine();
                    $this->error("Failed to copy file: {$oldPath}");
                    $failed++;
                }
            } catch (\Exception $e) {
                $this->newLine();
                $this->error("Error migrating media ID {$media->id}: {$e->getMessage()}");
                $failed++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info('Migration completed!');
        $this->info("Successfully migrated: {$migrated}");

        if ($failed > 0) {
            $this->warn("Failed: {$failed}");
        }

        return self::SUCCESS;
    }
}
