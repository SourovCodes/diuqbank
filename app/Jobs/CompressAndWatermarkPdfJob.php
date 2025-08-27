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
use Illuminate\Support\Str;
use setasign\Fpdi\Fpdi;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class CompressAndWatermarkPdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $questionId;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 600; // 10 minutes (increased due to watermarking)

    /**
     * Create a new job instance.
     */
    public function __construct(int $questionId)
    {
        $this->questionId = $questionId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Check if compression is enabled
        if (!config('pdf.compression.enabled', true)) {
            Log::info("PDF compression and watermarking is disabled, skipping for question ID: {$this->questionId}");
            return;
        }

        try {
            $question = Question::with('user')->find($this->questionId);
            if (!$question) {
                Log::warning("Question not found for compression and watermarking: {$this->questionId}");
                return;
            }
            if($question->is_watermarked){
                Log::info("Question already watermarked: {$this->questionId}");
                return;
            }

            $storage = Storage::disk('s3');
            $pdfKey = $question->pdf_key;

            if (!$storage->exists($pdfKey)) {
                Log::warning("PDF file does not exist for compression and watermarking: {$pdfKey}");
                return;
            }

            // Download the original PDF to temporary local storage
            $originalContent = $storage->get($pdfKey);
            $originalSize = strlen($originalContent);

            // Check if file is too large for processing
            $maxFileSize = config('pdf.compression.max_file_size');
            if ($maxFileSize && $originalSize > $maxFileSize) {
                Log::info("PDF file too large for processing: {$originalSize} bytes, max: {$maxFileSize} bytes");
                return;
            }

            $tempDir = sys_get_temp_dir();
            $originalPath = $tempDir . '/' . uniqid('pdf_original_') . '.pdf';
            $compressedPath = $tempDir . '/' . uniqid('pdf_compressed_') . '.pdf';
            $watermarkedPath = $tempDir . '/' . uniqid('pdf_watermarked_') . '.pdf';

            file_put_contents($originalPath, $originalContent);

            Log::info("Original PDF size: {$originalSize} bytes for question ID: {$this->questionId}");

            // Step 1: Compress the PDF using Ghostscript
            $this->compressPdf($originalPath, $compressedPath);

            // Check if compression was successful
            if (!file_exists($compressedPath)) {
                throw new \Exception("Compression failed - output file not created");
            }

            $compressedSize = filesize($compressedPath);
            Log::info("Compressed PDF size: {$compressedSize} bytes for question ID: {$this->questionId}");

            // Determine which file to use for watermarking
            $sourceForWatermarking = $compressedPath;
            $shouldReplaceOriginal = false;

            // Only use compressed version if it achieved significant reduction
            $minReductionThreshold = config('pdf.compression.min_reduction_threshold', 0.1);
            $reductionThreshold = 1 - $minReductionThreshold;
            
            if ($compressedSize < ($originalSize * $reductionThreshold)) {
                $shouldReplaceOriginal = true;
                $reductionPercent = round((($originalSize - $compressedSize) / $originalSize) * 100, 2);
                Log::info("PDF compressed successfully. Original: {$originalSize} bytes, Compressed: {$compressedSize} bytes, Reduction: {$reductionPercent}%");
            } else {
                $sourceForWatermarking = $originalPath;
                Log::info("Compression did not achieve significant size reduction for question ID {$this->questionId}. Using original file for watermarking.");
            }

            // Step 2: Add watermark to the PDF
            $this->watermarkPdf($sourceForWatermarking, $watermarkedPath, $question);

            // Check if watermarking was successful
            if (!file_exists($watermarkedPath)) {
                throw new \Exception("Watermarking failed - output file not created");
            }

            $watermarkedSize = filesize($watermarkedPath);
            Log::info("Watermarked PDF size: {$watermarkedSize} bytes for question ID: {$this->questionId}");

            // Step 3: Upload files back to S3
            $updateData = [];

            // Replace original PDF if compression was beneficial
            if ($shouldReplaceOriginal) {
                $compressedContent = file_get_contents($compressedPath);
                $storage->put($pdfKey, $compressedContent);
                $storage->setVisibility($pdfKey, 'public');
                $updateData['pdf_size'] = $compressedSize;
            }

            // Upload watermarked PDF
            $watermarkedUuid = Str::uuid();
            $watermarkedKey = "questions/watermarked/{$watermarkedUuid}.pdf";
            $watermarkedContent = file_get_contents($watermarkedPath);
            $storage->put($watermarkedKey, $watermarkedContent);
            $storage->setVisibility($watermarkedKey, 'public');

            // Update question with watermarked PDF key and mark as watermarked
            $updateData['watermarked_pdf_key'] = $watermarkedKey;
            $updateData['is_watermarked'] = true;

            $question->update($updateData);

            Log::info("PDF compression and watermarking completed successfully for question ID: {$this->questionId}");

            // Clean up temporary files
            $this->cleanupTempFiles([$originalPath, $compressedPath, $watermarkedPath]);

        } catch (\Exception $e) {
            Log::error("PDF compression and watermarking failed for question ID {$this->questionId}: " . $e->getMessage());
            
            // Clean up temporary files on error
            if (isset($originalPath, $compressedPath, $watermarkedPath)) {
                $this->cleanupTempFiles([$originalPath, $compressedPath, $watermarkedPath]);
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
     * Preprocess PDF using Ghostscript to ensure compatibility
     */
    private function preprocessPdf(string $inputPath, string $outputPath): void
    {
        $command = [
            'gs',
            '-sDEVICE=pdfwrite',
            '-dCompatibilityLevel=1.4',
            '-dPDFSETTINGS=/prepress',
            '-dNOPAUSE',
            '-dQUIET',
            '-dBATCH',
            "-sOutputFile={$outputPath}",
            $inputPath
        ];

        $process = new Process($command);
        $process->setTimeout(120); // 2 minutes timeout

        try {
            $process->mustRun();
            Log::info("PDF preprocessing completed for: {$inputPath}");
        } catch (ProcessFailedException $exception) {
            Log::error("PDF preprocessing failed: " . $exception->getMessage());
            Log::error("Command output: " . $process->getOutput());
            Log::error("Command error output: " . $process->getErrorOutput());
            throw new \Exception("PDF preprocessing failed: " . $exception->getMessage());
        }
    }

    /**
     * Add watermark to PDF using FPDI
     */
    private function watermarkPdf(string $inputPath, string $outputPath, Question $question): void
    {
        try {
            $tempDir = sys_get_temp_dir();
            $flattenedPath = $tempDir . '/' . uniqid('pdf_flattened_') . '.pdf';

            // First, preprocess the PDF to ensure compatibility
            $this->preprocessPdf($inputPath, $flattenedPath);

            // Now add watermark using FPDI
            $this->addWatermarkToPdf($flattenedPath, $outputPath, $question);

            // Clean up flattened file
            if (file_exists($flattenedPath)) {
                unlink($flattenedPath);
            }

            Log::info("FPDI watermarking completed for: {$inputPath}");
        } catch (\Exception $exception) {
            Log::error("FPDI watermarking failed: " . $exception->getMessage());
            throw new \Exception("PDF watermarking failed: " . $exception->getMessage());
        }
    }

    /**
     * Add watermark to PDF using FPDI library
     */
    private function addWatermarkToPdf(string $sourceFile, string $outputFile, Question $question): void
    {
        $uploaderName = $question->user->name ?? 'Unknown';
        $watermarkText = "For more questions: https://diuqbank.com | Uploader: {$uploaderName}";

        $pdf = new Fpdi();

        // Get the number of pages in the source PDF
        $pageCount = $pdf->setSourceFile($sourceFile);

        // Define optimized watermark header dimensions
        $fontSize = 9;          // Larger font for better readability
        $lineHeight = 3.5;      // Font height in units (approximately)
        $topPadding = 1;        // Minimal top padding
        $bottomPadding = 2;     // Minimal bottom padding
        $sidePadding = 2;       // Left/right padding for text
        
        // Calculate precise header height based on actual text requirements
        $headerHeight = $topPadding + $lineHeight + $bottomPadding; // Total: ~5.5 units
        
        // Loop through each page of the PDF
        for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
            // Get the page size and orientation
            $pageInfo = $pdf->getTemplateSize($pdf->importPage($pageNo));
            $orientation = ($pageInfo['width'] > $pageInfo['height']) ? 'L' : 'P';

            // Create new page with increased height to accommodate compact header
            $newHeight = $pageInfo['height'] + $headerHeight;
            $pdf->AddPage($orientation, [$pageInfo['width'], $newHeight]);

            // Add white background rectangle at the very top (compact size)
            $pdf->SetFillColor(255, 255, 255); // White color
            $pdf->Rect(0, 0, $pageInfo['width'], $headerHeight, 'F'); // Compact header rectangle

            // Set font and color for watermark text
            $pdf->SetFont('Arial', '', $fontSize); // Compact font size
            $pdf->SetTextColor(50, 50, 50); // Dark gray for subtle appearance

            // Position text with precise vertical centering
            $textY = $topPadding + ($lineHeight / 4); // Fine-tuned vertical position
            $pdf->SetXY($sidePadding, $textY);
            
            // Write text with proper spacing
            $pdf->Cell(0, $lineHeight, $watermarkText, 0, 0, 'L');

            // Import and place the original page content below the compact header
            $tplId = $pdf->importPage($pageNo);
            $pdf->useTemplate($tplId, 0, $headerHeight, $pageInfo['width'], $pageInfo['height']);
        }

        // Output the PDF to a file
        $pdf->Output('F', $outputFile);
    }

    /**
     * Clean up temporary files
     */
    private function cleanupTempFiles(array $filePaths): void
    {
        foreach ($filePaths as $filePath) {
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("PDF compression and watermarking job failed permanently for question ID {$this->questionId}: " . $exception->getMessage());
    }
}
