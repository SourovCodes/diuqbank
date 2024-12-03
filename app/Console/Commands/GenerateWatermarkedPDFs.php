<?php

namespace App\Console\Commands;

use App\Models\Question;
use Illuminate\Console\Command;

class GenerateWatermarkedPDFs extends Command
{
    protected $signature = 'media:generate-watermarked-pdfs';
    protected $description = 'Generate watermarked PDFs for all media in the "question-files" collection.';

    public function handle()
    {
        $this->info('Starting to generate custom watermarked PDFs...');

        Question::with('media')->chunk(100, function ($questions) {
            foreach ($questions as $question) {
                $mediaItems = $question->getMedia('question-files');

                foreach ($mediaItems as $media) {
//                    if($media->hasGeneratedConversion('watermarked'))continue;
                    $this->info("Processing media ID: {$media->id}");
                    try {
                        $media->addWatermark('Confidential');
                        $this->info("Watermarking completed for media ID: {$media->id}");
                    } catch (\Exception $e) {
                        $this->error("Failed to watermark media ID: {$media->id}. Error: {$e->getMessage()}");
                    }
                }
            }
        });

        $this->info('All watermarked PDFs generated successfully.');
    }
}
