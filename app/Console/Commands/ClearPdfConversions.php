<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ClearPdfConversions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:clear-pdf-conversions {--force : Skip confirmation prompt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all PDF conversions to allow regeneration with new disk configuration';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Clearing PDF conversions...');

        // Get all media items for pdf collection
        $mediaItems = Media::where('collection_name', 'pdf')->get();

        if ($mediaItems->isEmpty()) {
            $this->info('No PDF media found.');

            return self::SUCCESS;
        }

        $this->info("Found {$mediaItems->count()} PDF media items.");

        if (! $this->option('force')) {
            if (! $this->confirm('This will delete all PDF conversions. Do you want to continue?', false)) {
                $this->info('Operation cancelled.');

                return self::SUCCESS;
            }
        }

        $progressBar = $this->output->createProgressBar($mediaItems->count());
        $progressBar->start();

        $cleared = 0;
        $errors = 0;

        foreach ($mediaItems as $media) {
            try {
                // Get all generated conversions
                $conversions = $media->getGeneratedConversions();

                if ($conversions->isEmpty()) {
                    $progressBar->advance();

                    continue;
                }

                // Delete each conversion file
                foreach ($conversions as $conversionName => $generated) {
                    if ($generated) {
                        try {
                            // Delete the conversion file
                            $conversionPath = $media->getPath($conversionName);
                            if (file_exists($conversionPath)) {
                                unlink($conversionPath);
                            }

                            // Also try to delete from storage disk
                            $disk = Storage::disk($media->conversions_disk ?? $media->disk);
                            $relativePath = str_replace($disk->path(''), '', $conversionPath);
                            if ($disk->exists($relativePath)) {
                                $disk->delete($relativePath);
                            }
                        } catch (\Exception $e) {
                            // Continue with other conversions even if one fails
                        }
                    }
                }

                // Clear the generated conversions from the database
                $media->generated_conversions = [];
                $media->save();

                $cleared++;
            } catch (\Exception $e) {
                $this->newLine();
                $this->error("Error clearing conversions for media ID {$media->id}: {$e->getMessage()}");
                $errors++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info('PDF conversions cleared!');
        $this->info("Successfully cleared: {$cleared}");

        if ($errors > 0) {
            $this->warn("Errors: {$errors}");
        }

        $this->newLine();
        $this->comment('You can now regenerate conversions with: php artisan media:regenerate');

        return self::SUCCESS;
    }
}
