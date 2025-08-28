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
    protected $signature = 'app:watermark-existing-pdf';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $questions = Question::get();

        foreach ($questions as $question) {
          CompressAndWatermarkPdfJob::dispatch($question->id);
        }
    }
}
