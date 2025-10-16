<?php

namespace App\MediaLibrary\Conversions;

use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use setasign\Fpdi\Fpdi;
use setasign\Fpdi\PdfParser\CrossReference\CrossReferenceException;
use Spatie\MediaLibrary\Conversions\Conversion;
use Spatie\MediaLibrary\Conversions\ImageGenerators\ImageGenerator;
use Spatie\MediaLibrary\Conversions\ImageGenerators\Pdf as BasePdfGenerator;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class PdfWatermarkGenerator extends ImageGenerator
{
    // PDF dimensions - fixed width with aspect ratio maintained
    private const TARGET_WIDTH_MM = 210; // A4 width in millimeters

    // Watermark styling constants
    private const FONT_SIZE = 9;

    private const LINE_HEIGHT = 3.5;

    private const TOP_PADDING = 1;

    private const BOTTOM_PADDING = 2;

    private const SIDE_PADDING = 2;

    private const HEADER_HEIGHT = self::TOP_PADDING + self::LINE_HEIGHT + self::BOTTOM_PADDING;

    // Ghostscript configuration
    private const GS_TIMEOUT = 180;

    private const GS_IMAGE_RESOLUTION = 300; // 300 DPI for printer quality

    private const GS_DOWNSAMPLE_THRESHOLD = 1.5;

    // PDF error codes
    private const ERROR_ENCRYPTED = 268;

    protected ?Media $media = null;

    public function __construct(
        protected BasePdfGenerator $fallback
    ) {}

    public function canConvert(Media $media): bool
    {
        $this->media = $media;

        return parent::canConvert($media);
    }

    public function convert(string $file, ?Conversion $conversion = null): ?string
    {
        if ($conversion?->getName() === 'watermarked') {
            try {
                return $this->createWatermarkedPdf($file);
            } catch (\Throwable $exception) {
                report($exception);

                return null;
            }
        }

        return $this->fallback->convert($file, $conversion);
    }

    protected function createWatermarkedPdf(string $file): string
    {
        if (! class_exists(Fpdi::class)) {
            throw new \RuntimeException('FPDI is required to generate watermarked PDFs.');
        }

        $tempFile = null;

        try {
            $pdf = $this->initializeFpdi();
            $sourceFile = $file;

            // Attempt to load the PDF
            try {
                $pageCount = $pdf->setSourceFile($sourceFile);
            } catch (CrossReferenceException $exception) {
                // Handle encrypted PDFs - cannot process
                if ($exception->getCode() === self::ERROR_ENCRYPTED) {
                    $this->logWarning('PDF is encrypted, skipping watermark');

                    return $file;
                }

                // Try to normalize incompatible PDFs
                $this->logInfo('PDF has compatibility issues, attempting to normalize', [
                    'error_code' => $exception->getCode(),
                ]);

                $tempFile = $this->normalizePdfWithGhostscript($file);

                if (! $tempFile) {
                    $this->logWarning('Could not normalize PDF, skipping watermark');

                    return $file;
                }

                // Retry with normalized PDF
                $pdf = $this->initializeFpdi();
                $pageCount = $pdf->setSourceFile($tempFile);
                $sourceFile = $tempFile;

                $this->logInfo('Successfully normalized PDF for watermarking');
            }

            // Add watermark to all pages
            $this->addWatermarkToPages($pdf, $pageCount);

            $outputPath = $this->getOutputPath($file);
            $uncompressedPath = $this->getTempPath($file, 'uncompressed');

            // Output uncompressed watermarked PDF first
            $pdf->Output('F', $uncompressedPath);

            // Compress the watermarked PDF
            $compressedPath = $this->compressPdfWithGhostscript($uncompressedPath, $outputPath);

            // Clean up uncompressed temp file
            if (file_exists($uncompressedPath)) {
                @unlink($uncompressedPath);
            }

            return $compressedPath ?: $uncompressedPath;
        } finally {
            // Always clean up temp file
            if ($tempFile && file_exists($tempFile)) {
                @unlink($tempFile);
            }
        }
    }

    protected function initializeFpdi(): Fpdi
    {
        $pdf = new Fpdi;
        $pdf->SetMargins(0, 0, 0);
        $pdf->SetAutoPageBreak(false);

        return $pdf;
    }

    protected function addWatermarkToPages(Fpdi $pdf, int $pageCount): void
    {
        $watermarkText = $this->resolveWatermarkText();

        for ($pageNumber = 1; $pageNumber <= $pageCount; $pageNumber++) {
            $templateId = $pdf->importPage($pageNumber);
            $pageSize = $pdf->getTemplateSize($templateId);

            // Calculate dimensions - only downscale if larger than target width
            $originalWidth = $pageSize['width'];
            $originalHeight = $pageSize['height'];

            // Only scale down if width exceeds target, otherwise keep original size
            if ($originalWidth > self::TARGET_WIDTH_MM) {
                $aspectRatio = $originalHeight / $originalWidth;
                $finalWidth = self::TARGET_WIDTH_MM;
                $scaledContentHeight = $finalWidth * $aspectRatio;
            } else {
                $finalWidth = $originalWidth;
                $scaledContentHeight = $originalHeight;
            }

            $totalHeight = $scaledContentHeight + self::HEADER_HEIGHT;
            $orientation = $finalWidth > $totalHeight ? 'L' : 'P';

            $pdf->AddPage($orientation, [$finalWidth, $totalHeight]);

            // Draw watermark header
            $this->drawWatermarkHeader($pdf, $finalWidth, $watermarkText);

            // Place original page content below header
            $pdf->useTemplate($templateId, 0, self::HEADER_HEIGHT, $finalWidth, $scaledContentHeight);
        }
    }

    protected function drawWatermarkHeader(Fpdi $pdf, float $pageWidth, string $text): void
    {
        // White background
        $pdf->SetFillColor(255, 255, 255);
        $pdf->Rect(0, 0, $pageWidth, self::HEADER_HEIGHT, 'F');

        // Subtle border line
        $pdf->SetDrawColor(210, 210, 210);
        $pdf->Line(0, self::HEADER_HEIGHT, $pageWidth, self::HEADER_HEIGHT);

        // Watermark text
        $pdf->SetFont('Arial', '', self::FONT_SIZE);
        $pdf->SetTextColor(50, 50, 50);

        $textY = self::TOP_PADDING + (self::LINE_HEIGHT / 4);
        $pdf->SetXY(self::SIDE_PADDING, $textY);
        $pdf->Cell($pageWidth - (self::SIDE_PADDING * 2), self::LINE_HEIGHT, $text, 0, 0, 'L');
    }

    /**
     * Normalize a PDF using Ghostscript for compatibility and optimization.
     */
    protected function normalizePdfWithGhostscript(string $inputFile): ?string
    {
        $gsPath = trim(shell_exec('which gs 2>/dev/null') ?? '');
        if (empty($gsPath)) {
            $this->logInfo('Ghostscript not available, cannot normalize PDF');

            return null;
        }

        $outputFile = $this->getTempPath($inputFile, 'normalized');

        try {
            $process = new Process($this->buildGhostscriptCommand($gsPath, $inputFile, $outputFile));
            $process->setTimeout(self::GS_TIMEOUT);
            $process->mustRun();

            if (! file_exists($outputFile)) {
                return null;
            }

            $this->logNormalizationSuccess($inputFile, $outputFile);

            return $outputFile;
        } catch (ProcessFailedException $exception) {
            $this->logWarning('Ghostscript PDF normalization failed', [
                'error' => $exception->getMessage(),
                'output' => $process->getOutput(),
                'error_output' => $process->getErrorOutput(),
            ]);

            if (file_exists($outputFile)) {
                @unlink($outputFile);
            }

            return null;
        } catch (\Throwable $exception) {
            $this->logWarning('PDF normalization failed with exception', [
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Compress a watermarked PDF using Ghostscript for size optimization.
     */
    protected function compressPdfWithGhostscript(string $inputFile, string $outputFile): ?string
    {
        $gsPath = trim(shell_exec('which gs 2>/dev/null') ?? '');
        if (empty($gsPath)) {
            $this->logInfo('Ghostscript not available, cannot compress PDF');

            return null;
        }

        try {
            $originalSize = filesize($inputFile);

            $process = new Process($this->buildGhostscriptCommand($gsPath, $inputFile, $outputFile));
            $process->setTimeout(self::GS_TIMEOUT);
            $process->mustRun();

            if (! file_exists($outputFile)) {
                return null;
            }

            $compressedSize = filesize($outputFile);

            $this->logInfo('PDF optimized successfully', [
                'original_size_kb' => round($originalSize / 1024, 2),
                'optimized_size_kb' => round($compressedSize / 1024, 2),
                'size_reduction_kb' => round(($originalSize - $compressedSize) / 1024, 2),
                'size_reduction_percent' => round((($originalSize - $compressedSize) / $originalSize) * 100, 1),
            ]);

            return $outputFile;
        } catch (ProcessFailedException $exception) {
            $this->logWarning('Ghostscript PDF compression failed', [
                'error' => $exception->getMessage(),
                'output' => $process->getOutput(),
                'error_output' => $process->getErrorOutput(),
            ]);

            if (file_exists($outputFile)) {
                @unlink($outputFile);
            }

            return null;
        } catch (\Throwable $exception) {
            $this->logWarning('PDF compression failed with exception', [
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    protected function buildGhostscriptCommand(string $gsPath, string $inputFile, string $outputFile): array
    {
        return [
            $gsPath,
            '-sDEVICE=pdfwrite',
            '-dCompatibilityLevel=1.4',
            '-dPDFSETTINGS=/printer', // High quality for printing (300 DPI)
            '-dNOPAUSE',
            '-dQUIET',
            '-dBATCH',
            '-dDetectDuplicateImages=true',
            '-dCompressFonts=true',
            '-dSubsetFonts=true',
            '-dCompressPages=true',
            '-dUseFlateCompression=true',
            '-dColorImageDownsampleType=/Bicubic',
            '-dColorImageResolution='.self::GS_IMAGE_RESOLUTION,
            '-dGrayImageDownsampleType=/Bicubic',
            '-dGrayImageResolution='.self::GS_IMAGE_RESOLUTION,
            '-dMonoImageDownsampleType=/Bicubic',
            '-dMonoImageResolution='.self::GS_IMAGE_RESOLUTION,
            '-dOptimize=true',
            '-dEmbedAllFonts=true',
            '-dAutoRotatePages=/None',
            '-dColorImageDownsampleThreshold='.self::GS_DOWNSAMPLE_THRESHOLD,
            '-dGrayImageDownsampleThreshold='.self::GS_DOWNSAMPLE_THRESHOLD,
            '-dMonoImageDownsampleThreshold='.self::GS_DOWNSAMPLE_THRESHOLD,
            '-dDownsampleColorImages=true',
            '-dDownsampleGrayImages=true',
            '-dDownsampleMonoImages=true',
            '-dColorConversionStrategy=/LeaveColorUnchanged',
            '-dDoThumbnails=false',
            '-dPreserveAnnots=true',
            "-sOutputFile={$outputFile}",
            $inputFile,
        ];
    }

    public function requirementsAreInstalled(): bool
    {
        return class_exists(Fpdi::class);
    }

    public function supportedExtensions(): Collection
    {
        return collect(['pdf']);
    }

    public function supportedMimeTypes(): Collection
    {
        return collect(['application/pdf']);
    }

    protected function resolveWatermarkText(): string
    {
        $uploaderName = $this->resolveUploaderName();

        return $uploaderName
            ? "For more questions: https://diuqbank.com | Uploader: {$uploaderName}"
            : 'For more questions: https://diuqbank.com';
    }

    protected function resolveUploaderName(): ?string
    {
        $model = $this->media?->model;

        if (! $model instanceof EloquentModel) {
            return null;
        }

        // Try to get name from user relationship
        if (method_exists($model, 'user')) {
            $user = $model->user;

            if ($user?->name) {
                return $user->name;
            }
        }

        // Fallback to model's own name
        return $model->name ?? null;
    }

    protected function getOutputPath(string $file): string
    {
        return sprintf(
            '%s/%s-watermarked.pdf',
            pathinfo($file, PATHINFO_DIRNAME),
            pathinfo($file, PATHINFO_FILENAME)
        );
    }

    protected function getTempPath(string $file, string $suffix): string
    {
        return sprintf(
            '%s/%s-%s.pdf',
            pathinfo($file, PATHINFO_DIRNAME),
            pathinfo($file, PATHINFO_FILENAME),
            $suffix
        );
    }

    protected function getLogContext(array $extra = []): array
    {
        return array_merge([
            'file' => $this->media ? basename($this->media->file_name) : 'unknown',
            'media_id' => $this->media?->id,
        ], $extra);
    }

    protected function logInfo(string $message, array $context = []): void
    {
        Log::info($message, $this->getLogContext($context));
    }

    protected function logWarning(string $message, array $context = []): void
    {
        Log::warning($message, $this->getLogContext($context));
    }

    protected function logNormalizationSuccess(string $inputFile, string $outputFile): void
    {
        $originalSize = filesize($inputFile);
        $normalizedSize = filesize($outputFile);

        $this->logInfo('PDF normalized successfully', [
            'original_size_kb' => round($originalSize / 1024, 2),
            'normalized_size_kb' => round($normalizedSize / 1024, 2),
            'size_change_percent' => round((($normalizedSize - $originalSize) / $originalSize) * 100, 1),
        ]);
    }
}
