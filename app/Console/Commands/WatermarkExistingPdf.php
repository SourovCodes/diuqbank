<?php

namespace App\Console\Commands;

use App\Jobs\CompressAndWatermarkPdfJob;
use App\Models\Question;
use Illuminate\Console\Command;

class WatermarkExistingPdf extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:watermark-existing-pdf {--force-all : Reset all questions to unwatermarked and process them}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Watermark existing PDF questions that are not yet watermarked';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('force-all')) {
            $this->info('Force-all option detected. Resetting all questions to unwatermarked status...');
            
            // Update all questions to is_watermarked = false
            $updateCount = Question::query()->update(['is_watermarked' => false]);
            $this->info("Reset {$updateCount} questions to unwatermarked status.");
            
            // Get all questions
            $questions = Question::all();
        } else {
            // Get only questions that are not watermarked
            $questions = Question::where('is_watermarked', false)->get();
        }

        $this->info("Processing {$questions->count()} questions for watermarking...");

        foreach ($questions as $question) {
            CompressAndWatermarkPdfJob::dispatch($question->id);
        }

        $this->info("Dispatched {$questions->count()} watermarking jobs.");
    }
}
