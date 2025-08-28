<?php

namespace App\Console\Commands;

use App\Models\Question;
use App\Models\UserReport;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class CleanupBrokenPdfQuestions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cleanup-broken-pdf-questions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check all questions for broken PDF links (404) and delete those questions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting PDF link validation for all questions...');
        
        // Get all questions that have a pdf_key
        $questions = Question::whereNotNull('pdf_key')->get();
        $totalQuestions = $questions->count();
        
        $this->info("Found {$totalQuestions} questions with PDF keys to check.");
        
        $brokenCount = 0;
        $checkedCount = 0;
        $errorCount = 0;
        
        $progressBar = $this->output->createProgressBar($totalQuestions);
        $progressBar->start();
        
        foreach ($questions as $question) {
            $checkedCount++;
            
            try {
                $pdfUrl = $question->pdf_url;
                
                if (!$pdfUrl) {
                    $this->warn("\nQuestion ID {$question->id} has no PDF URL, skipping...");
                    continue;
                }
                
                // Check if PDF URL returns 404
                $response = Http::timeout(10)->head($pdfUrl);
                
                if ($response->status() === 404) {
                    $this->warn("\nFound broken PDF for Question ID {$question->id}. URL: {$pdfUrl}");
                    
                    // Delete associated user reports first
                    $deletedReports = UserReport::where('question_id', $question->id)->count();
                    UserReport::where('question_id', $question->id)->delete();
                    
                    if ($deletedReports > 0) {
                        $this->info("Deleted {$deletedReports} associated user report(s) for Question ID {$question->id}.");
                    }
                    
                    // Delete the question
                    $question->delete();
                    $brokenCount++;
                    
                    $this->info("Deleted Question ID {$question->id} due to broken PDF link.");
                }
                
            } catch (\Exception $e) {
                $errorCount++;
                $this->warn("\nError checking Question ID {$question->id}: " . $e->getMessage());
            }
            
            $progressBar->advance();
        }
        
        $progressBar->finish();
        
        // Display final statistics
        $this->newLine();
        $this->info('PDF link validation completed!');
        $this->info("Total questions checked: {$checkedCount}");
        $this->info("Questions with broken PDFs (deleted): {$brokenCount}");
        $this->info("Errors encountered: {$errorCount}");
        $this->info("Remaining questions: " . ($totalQuestions - $brokenCount));
        
        if ($brokenCount > 0) {
            $this->warn("Deleted {$brokenCount} questions with broken PDF links.");
        } else {
            $this->info("No questions with broken PDF links were found.");
        }
    }
}
