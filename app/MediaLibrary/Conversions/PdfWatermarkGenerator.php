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

class PdfWatermarkGenerator extends ImageGenerator
{
    public function __construct(
        protected BasePdfGenerator $fallback
    ) {}

    protected ?Media $media = null;

    public function canConvert(Media $media): bool
    {
        $this->media = $media;

        return parent::canConvert($media);
    }

    public function convert(string $file, ?Conversion $conversion = null): ?string
    {
        if ($conversion && $conversion->getName() === 'watermarked') {
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

        // Compress PDF first to reduce file size
        $compressedFile = $this->compressPdf($file);
        $sourceFile = $compressedFile ?? $file;

        $pdf = new Fpdi;
        $pdf->SetMargins(0, 0, 0);
        $pdf->SetAutoPageBreak(false);

        try {
            $pageCount = $pdf->setSourceFile($sourceFile);
        } catch (CrossReferenceException $exception) {
            // Handle PDFs with unsupported compression or encryption
            $errorCode = $exception->getCode();

            if ($errorCode === 267) {
                Log::info('PDF uses unsupported compression technique, attempting to reprocess', [
                    'file' => basename($file),
                    'media_id' => $this->media?->id,
                ]);

                // Try to reprocess the PDF with Ghostscript to make it compatible
                $reprocessedFile = $this->reprocessPdfForCompatibility($file);

                if ($reprocessedFile && $reprocessedFile !== $file) {
                    try {
                        // Try again with the reprocessed file
                        $pdf = new Fpdi;
                        $pdf->SetMargins(0, 0, 0);
                        $pdf->SetAutoPageBreak(false);
                        $pageCount = $pdf->setSourceFile($reprocessedFile);
                        $sourceFile = $reprocessedFile;

                        Log::info('Successfully reprocessed PDF for watermarking', [
                            'file' => basename($file),
                            'media_id' => $this->media?->id,
                        ]);
                    } catch (CrossReferenceException $retryException) {
                        Log::warning('PDF reprocessing failed, skipping watermark', [
                            'file' => basename($file),
                            'media_id' => $this->media?->id,
                            'retry_error_code' => $retryException->getCode(),
                        ]);

                        // Clean up reprocessed file
                        if (file_exists($reprocessedFile)) {
                            @unlink($reprocessedFile);
                        }

                        return $file;
                    }
                } else {
                    Log::warning('Could not reprocess PDF, skipping watermark', [
                        'file' => basename($file),
                        'media_id' => $this->media?->id,
                    ]);

                    return $file;
                }
            } elseif ($errorCode === 268) {
                Log::warning('PDF is encrypted, skipping watermark', [
                    'file' => basename($file),
                    'media_id' => $this->media?->id,
                ]);

                return $file;
            } else {
                Log::warning('PDF has unknown issue, skipping watermark', [
                    'file' => basename($file),
                    'media_id' => $this->media?->id,
                    'error_code' => $errorCode,
                ]);

                return $file;
            }
        }

        $watermarkText = $this->resolveWatermarkText();

        for ($pageNumber = 1; $pageNumber <= $pageCount; $pageNumber++) {
            $templateId = $pdf->importPage($pageNumber);
            $pageSize = $pdf->getTemplateSize($templateId);

            // Normalize page size to standard dimensions
            $normalizedSize = $this->normalizePageSize($pageSize);
            $headerHeight = $this->determineHeaderHeight($normalizedSize['height']);
            $orientation = $normalizedSize['orientation'];

            $pdf->AddPage($orientation, [$normalizedSize['width'], $normalizedSize['height'] + $headerHeight]);

            $pdf->SetFillColor(255, 255, 255);
            $pdf->Rect(0, 0, $normalizedSize['width'], $headerHeight, 'F');

            $pdf->SetDrawColor(210, 210, 210);
            $pdf->Line(0, $headerHeight, $normalizedSize['width'], $headerHeight);

            // Scale the template to fit the normalized size
            $scaleX = $normalizedSize['width'] / $pageSize['width'];
            $scaleY = $normalizedSize['height'] / $pageSize['height'];
            $scale = min($scaleX, $scaleY);

            $scaledWidth = $pageSize['width'] * $scale;
            $scaledHeight = $pageSize['height'] * $scale;

            // Center the content if needed
            $offsetX = ($normalizedSize['width'] - $scaledWidth) / 2;
            $offsetY = $headerHeight + (($normalizedSize['height'] - $scaledHeight) / 2);

            $pdf->useTemplate($templateId, $offsetX, $offsetY, $scaledWidth);

            $fontSize = $this->determineFontSize($normalizedSize['width']);
            $pdf->SetTextColor(0, 0, 0);
            $pdf->SetFont('Helvetica', '', $fontSize);
            $pdf->SetXY(6, $this->calculateTextYPosition($headerHeight, $fontSize));
            $pdf->Cell($normalizedSize['width'] - 12, $fontSize + 2, $watermarkText, 0, 0, 'L');
        }

        $outputPath = sprintf(
            '%s/%s-watermarked.pdf',
            pathinfo($file, PATHINFO_DIRNAME),
            pathinfo($file, PATHINFO_FILENAME)
        );

        $pdf->Output('F', $outputPath);

        // Clean up temporary files
        if ($compressedFile && $compressedFile !== $file && file_exists($compressedFile)) {
            @unlink($compressedFile);
        }

        // Clean up reprocessed file if it was created and different from source
        if ($sourceFile !== $file && $sourceFile !== $compressedFile && file_exists($sourceFile)) {
            @unlink($sourceFile);
        }

        return $outputPath;
    }

    protected function compressPdf(string $inputFile): ?string
    {
        // Check if Ghostscript is available
        exec('which gs 2>/dev/null', $output, $returnCode);
        if ($returnCode !== 0) {
            Log::info('Ghostscript not available, skipping PDF compression', [
                'file' => basename($inputFile),
                'media_id' => $this->media?->id,
            ]);

            return null;
        }

        try {
            $outputFile = sprintf(
                '%s/%s-compressed.pdf',
                pathinfo($inputFile, PATHINFO_DIRNAME),
                pathinfo($inputFile, PATHINFO_FILENAME)
            );

            // Use Ghostscript to compress the PDF
            // -dPDFSETTINGS options:
            // /screen (72 dpi) - lowest quality, smallest size
            // /ebook (150 dpi) - moderate quality
            // /printer (300 dpi) - high quality
            // /prepress (300 dpi) - high quality, color preserving
            $command = sprintf(
                'gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=%s %s 2>&1',
                escapeshellarg($outputFile),
                escapeshellarg($inputFile)
            );

            exec($command, $output, $returnCode);

            if ($returnCode !== 0) {
                Log::warning('Ghostscript compression failed, using original file', [
                    'file' => basename($inputFile),
                    'media_id' => $this->media?->id,
                    'error' => implode("\n", $output),
                ]);

                return null;
            }

            // Verify the compressed file exists and is smaller
            if (file_exists($outputFile)) {
                $originalSize = filesize($inputFile);
                $compressedSize = filesize($outputFile);

                // Only use compressed version if it's actually smaller
                if ($compressedSize < $originalSize) {
                    $reduction = round((($originalSize - $compressedSize) / $originalSize) * 100, 1);
                    Log::info('PDF compressed successfully', [
                        'file' => basename($inputFile),
                        'media_id' => $this->media?->id,
                        'original_size_kb' => round($originalSize / 1024, 2),
                        'compressed_size_kb' => round($compressedSize / 1024, 2),
                        'reduction_percent' => $reduction,
                    ]);

                    return $outputFile;
                } else {
                    Log::info('Compressed file not smaller, using original', [
                        'file' => basename($inputFile),
                        'media_id' => $this->media?->id,
                    ]);
                    @unlink($outputFile);

                    return null;
                }
            }

            return null;
        } catch (\Throwable $exception) {
            Log::warning('PDF compression failed with exception', [
                'file' => basename($inputFile),
                'media_id' => $this->media?->id,
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    protected function reprocessPdfForCompatibility(string $inputFile): ?string
    {
        // Check if Ghostscript is available
        exec('which gs 2>/dev/null', $output, $returnCode);
        if ($returnCode !== 0) {
            Log::info('Ghostscript not available, cannot reprocess PDF', [
                'file' => basename($inputFile),
                'media_id' => $this->media?->id,
            ]);

            return null;
        }

        try {
            $outputFile = sprintf(
                '%s/%s-reprocessed.pdf',
                pathinfo($inputFile, PATHINFO_DIRNAME),
                pathinfo($inputFile, PATHINFO_FILENAME)
            );

            // Use Ghostscript to reprocess the PDF for compatibility
            // This decompresses and reconstructs the PDF in a standard format
            $command = sprintf(
                'gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/default -dNOPAUSE -dQUIET -dBATCH -dAutoRotatePages=/None -dColorImageDownsampleType=/Bicubic -dColorImageResolution=150 -dGrayImageDownsampleType=/Bicubic -dGrayImageResolution=150 -dMonoImageDownsampleType=/Bicubic -dMonoImageResolution=150 -sOutputFile=%s %s 2>&1',
                escapeshellarg($outputFile),
                escapeshellarg($inputFile)
            );

            exec($command, $output, $returnCode);

            if ($returnCode !== 0) {
                Log::warning('Ghostscript PDF reprocessing failed', [
                    'file' => basename($inputFile),
                    'media_id' => $this->media?->id,
                    'error' => implode("\n", $output),
                ]);

                return null;
            }

            // Verify the reprocessed file exists
            if (file_exists($outputFile)) {
                Log::info('PDF reprocessed for compatibility', [
                    'file' => basename($inputFile),
                    'media_id' => $this->media?->id,
                    'original_size_kb' => round(filesize($inputFile) / 1024, 2),
                    'reprocessed_size_kb' => round(filesize($outputFile) / 1024, 2),
                ]);

                return $outputFile;
            }

            return null;
        } catch (\Throwable $exception) {
            Log::warning('PDF reprocessing failed with exception', [
                'file' => basename($inputFile),
                'media_id' => $this->media?->id,
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
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

        if ($uploaderName) {
            return sprintf('https://diuqbank.com | uploader: %s', $uploaderName);
        }

        return 'https://diuqbank.com';
    }

    protected function resolveUploaderName(): ?string
    {
        $mediaOwner = $this->media?->model;

        if (! $mediaOwner instanceof EloquentModel) {
            return null;
        }

        if (method_exists($mediaOwner, 'user')) {
            $mediaOwner->loadMissing('user');
            $user = $mediaOwner->getRelation('user') ?? $mediaOwner->user ?? null;

            if ($user instanceof EloquentModel && isset($user->name) && is_string($user->name)) {
                return $user->name;
            }

            if (is_object($user) && isset($user->name) && is_string($user->name)) {
                return $user->name;
            }
        }

        if (isset($mediaOwner->name) && is_string($mediaOwner->name)) {
            return $mediaOwner->name;
        }

        return null;
    }

    protected function determineFontSize(float $width): float
    {
        $calculated = round($width * 0.028, 2);

        return max(9, min(14, $calculated));
    }

    protected function determineHeaderHeight(float $height): float
    {
        $calculated = round($height * 0.03, 2);

        return max(8.0, min(18.0, $calculated));
    }

    protected function calculateTextYPosition(float $headerHeight, float $fontSize): float
    {
        $baselineOffset = max(0.0, ($headerHeight - $fontSize) / 2);

        return max(0.0, round(max(0.0, $baselineOffset - ($fontSize * 0.35)), 2));
    }

    protected function normalizePageSize(array $pageSize): array
    {
        $width = $pageSize['width'];
        $height = $pageSize['height'];
        $isLandscape = $width > $height;

        // Define standard page sizes (in points: 1 inch = 72 points)
        // Ordered from smallest to largest to prefer downsizing
        $standardSizes = [
            'A4' => ['width' => 595.28, 'height' => 841.89], // 210mm × 297mm
            'Letter' => ['width' => 612.0, 'height' => 792.0], // 8.5" × 11"
            'Legal' => ['width' => 612.0, 'height' => 1008.0], // 8.5" × 14"
            'A3' => ['width' => 841.89, 'height' => 1190.55], // 297mm × 420mm
        ];

        // Calculate the aspect ratio
        $aspectRatio = $isLandscape ? $height / $width : $width / $height;
        $currentArea = $width * $height;

        // Find the best matching standard size, preferring smaller sizes that can fit the content
        $bestMatch = null;
        $minDifference = PHP_FLOAT_MAX;

        foreach ($standardSizes as $name => $size) {
            $standardAspectRatio = $size['width'] / $size['height'];
            $ratioDifference = abs($aspectRatio - $standardAspectRatio);

            $standardArea = $size['width'] * $size['height'];

            // Only consider sizes that are not larger than the original
            // or if all sizes are smaller, pick the one with best aspect ratio
            if ($standardArea <= $currentArea) {
                // Prefer sizes that are smaller but have similar aspect ratio
                $totalDifference = $ratioDifference * 10;

                if ($totalDifference < $minDifference) {
                    $minDifference = $totalDifference;
                    $bestMatch = $size;
                }
            } elseif ($bestMatch === null) {
                // If no smaller size found yet, consider this but with penalty
                $totalDifference = $ratioDifference * 10 + 1;

                if ($totalDifference < $minDifference) {
                    $minDifference = $totalDifference;
                    $bestMatch = $size;
                }
            }
        }

        // Normalize if larger than standard A4 dimensions
        $maxWidth = $isLandscape ? $height : $width;
        $maxHeight = $isLandscape ? $width : $height;
        $shouldNormalize = $maxWidth > 650 || $maxHeight > 900; // Normalize if larger than typical sizes

        if ($shouldNormalize && $bestMatch) {
            return [
                'width' => $isLandscape ? $bestMatch['height'] : $bestMatch['width'],
                'height' => $isLandscape ? $bestMatch['width'] : $bestMatch['height'],
                'orientation' => $isLandscape ? 'L' : 'P',
            ];
        }

        // Return original size if within acceptable range
        return [
            'width' => $width,
            'height' => $height,
            'orientation' => $isLandscape ? 'L' : 'P',
        ];
    }
}
