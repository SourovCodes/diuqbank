<?php

namespace App\Jobs;

use App\Models\Question;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class CompressPdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $pdfKey;
    protected string $disk;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 300; // 5 minutes

    /**
     * Create a new job instance.
     */
    public function __construct(string $pdfKey, string $disk = 's3')
    {
        $this->pdfKey = $pdfKey;
        $this->disk = $disk;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Check if compression is enabled
        if (!config('pdf.compression.enabled', true)) {
            Log::info("PDF compression is disabled, skipping compression for: {$this->pdfKey}");
            return;
        }

        try {
            $storage = Storage::disk($this->disk);

            if (!$storage->exists($this->pdfKey)) {
                Log::warning("PDF file does not exist for compression: {$this->pdfKey}");
                return;
            }

            // Download the original PDF to temporary local storage
            $originalContent = $storage->get($this->pdfKey);
            $originalSize = strlen($originalContent);

            // Check if file is too large for compression
            $maxFileSize = config('pdf.compression.max_file_size');
            if ($maxFileSize && $originalSize > $maxFileSize) {
                Log::info("PDF file too large for compression: {$originalSize} bytes, max: {$maxFileSize} bytes");
                return;
            }

            $tempDir = sys_get_temp_dir();
            $originalPath = $tempDir . '/' . uniqid('pdf_original_') . '.pdf';
            $compressedPath = $tempDir . '/' . uniqid('pdf_compressed_') . '.pdf';

            file_put_contents($originalPath, $originalContent);

            Log::info("Original PDF size: {$originalSize} bytes for file: {$this->pdfKey}");

            // Compress the PDF using Ghostscript
            $this->compressPdf($originalPath, $compressedPath);

            // Check if compression was successful and beneficial
            if (!file_exists($compressedPath)) {
                throw new \Exception("Compression failed - output file not created");
            }

            $compressedSize = filesize($compressedPath);
            Log::info("Compressed PDF size: {$compressedSize} bytes for file: {$this->pdfKey}");

            // Only replace if compression achieved significant reduction
            $minReductionThreshold = config('pdf.compression.min_reduction_threshold', 0.1);
            $reductionThreshold = 1 - $minReductionThreshold;
            
            if ($compressedSize < ($originalSize * $reductionThreshold)) {
                // Upload compressed PDF back to storage
                $compressedContent = file_get_contents($compressedPath);
                $storage->put($this->pdfKey, $compressedContent);
                
                // Set visibility to public if it was public before
                $storage->setVisibility($this->pdfKey, 'public');

                // Update the pdf_size in the database
                $this->updateQuestionPdfSize($compressedSize);

                $reductionPercent = round((($originalSize - $compressedSize) / $originalSize) * 100, 2);
                Log::info("PDF compressed successfully. Original: {$originalSize} bytes, Compressed: {$compressedSize} bytes, Reduction: {$reductionPercent}%");
            } else {
                Log::info("Compression did not achieve significant size reduction for {$this->pdfKey}. Keeping original file.");
            }

            // Clean up temporary files
            unlink($originalPath);
            if (file_exists($compressedPath)) {
                unlink($compressedPath);
            }

        } catch (\Exception $e) {
            Log::error("PDF compression failed for {$this->pdfKey}: " . $e->getMessage());
            
            // Clean up temporary files on error
            if (isset($originalPath) && file_exists($originalPath)) {
                unlink($originalPath);
            }
            if (isset($compressedPath) && file_exists($compressedPath)) {
                unlink($compressedPath);
            }
            
            throw $e;
        }
    }

    /**
     * Compress PDF using Ghostscript with optimized settings for web viewing
     */
    private function compressPdf(string $inputPath, string $outputPath): void
    {
        $config = config('pdf.compression.ghostscript');
        
        // Ghostscript command for PDF compression and optimization
        // This will:
        // - Set PDF compatibility level from config
        // - Use configured quality settings (good balance of quality and size)
        // - Downsample images to configured DPI values
        // - Compress images using JPEG with good quality
        // - Optimize for web viewing (linearized PDF)
        $command = [
            'gs',
            '-sDEVICE=pdfwrite',
            '-dCompatibilityLevel=' . $config['compatibility_level'],
            '-dPDFSETTINGS=' . $config['pdf_settings'],
            '-dNOPAUSE',
            '-dQUIET',
            '-dBATCH',
            '-dDetectDuplicateImages',
            '-dCompressFonts=true',
            '-dSubsetFonts=true',
            '-dColorImageDownsampleType=/Bicubic',
            '-dColorImageResolution=' . $config['color_image_resolution'],
            '-dGrayImageDownsampleType=/Bicubic', 
            '-dGrayImageResolution=' . $config['grayscale_image_resolution'],
            '-dMonoImageDownsampleType=/Bicubic',
            '-dMonoImageResolution=' . $config['monochrome_image_resolution'],
            '-dOptimize=true',
            '-dEmbedAllFonts=true',
            '-dAutoRotatePages=/None',
            '-dColorImageDownsampleThreshold=' . $config['color_image_threshold'],
            '-dGrayImageDownsampleThreshold=' . $config['grayscale_image_threshold'],
            '-dMonoImageDownsampleThreshold=' . $config['monochrome_image_threshold'],
            "-sOutputFile={$outputPath}",
            $inputPath
        ];

        $process = new Process($command);
        $process->setTimeout($config['timeout']);

        try {
            $process->mustRun();
            Log::info("Ghostscript compression completed for: {$inputPath}");
        } catch (ProcessFailedException $exception) {
            Log::error("Ghostscript compression failed: " . $exception->getMessage());
            Log::error("Command output: " . $process->getOutput());
            Log::error("Command error output: " . $process->getErrorOutput());
            throw new \Exception("PDF compression failed: " . $exception->getMessage());
        }
    }

    /**
     * Update the pdf_size field in the Question model after successful compression
     */
    private function updateQuestionPdfSize(int $newSize): void
    {
        try {
            $question = Question::where('pdf_key', $this->pdfKey)->first();
            
            if ($question) {
                $oldSize = $question->pdf_size;
                $question->update(['pdf_size' => $newSize]);
                
                Log::info("Updated Question ID {$question->id} pdf_size from {$oldSize} to {$newSize} bytes");
            } else {
                Log::warning("Could not find Question with pdf_key: {$this->pdfKey} to update pdf_size");
            }
        } catch (\Exception $e) {
            Log::error("Failed to update pdf_size for {$this->pdfKey}: " . $e->getMessage());
            // Don't throw exception here as compression was successful, just the DB update failed
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("PDF compression job failed permanently for {$this->pdfKey}: " . $exception->getMessage());
    }
}
