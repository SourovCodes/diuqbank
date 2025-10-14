<?php

namespace App\MediaLibrary\Conversions;

use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Support\Collection;
use setasign\Fpdi\Fpdi;
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

        $pdf = new Fpdi;
        $pdf->SetMargins(0, 0, 0);
        $pdf->SetAutoPageBreak(false);

        $pageCount = $pdf->setSourceFile($file);
        $watermarkText = $this->resolveWatermarkText();

        for ($pageNumber = 1; $pageNumber <= $pageCount; $pageNumber++) {
            $templateId = $pdf->importPage($pageNumber);
            $pageSize = $pdf->getTemplateSize($templateId);

            $headerHeight = $this->determineHeaderHeight($pageSize['height']);
            $orientation = $pageSize['width'] > $pageSize['height'] ? 'L' : 'P';

            $pdf->AddPage($orientation, [$pageSize['width'], $pageSize['height'] + $headerHeight]);

            $pdf->SetFillColor(255, 255, 255);
            $pdf->Rect(0, 0, $pageSize['width'], $headerHeight, 'F');

            $pdf->SetDrawColor(210, 210, 210);
            $pdf->Line(0, $headerHeight, $pageSize['width'], $headerHeight);

            $pdf->useTemplate($templateId, 0, $headerHeight, $pageSize['width']);

            $fontSize = $this->determineFontSize($pageSize['width']);
            $pdf->SetTextColor(0, 0, 0);
            $pdf->SetFont('Helvetica', '', $fontSize);
            $pdf->SetXY(6, $this->calculateTextYPosition($headerHeight, $fontSize));
            $pdf->Cell($pageSize['width'] - 12, $fontSize + 2, $watermarkText, 0, 0, 'L');
        }

        $outputPath = sprintf(
            '%s/%s-watermarked.pdf',
            pathinfo($file, PATHINFO_DIRNAME),
            pathinfo($file, PATHINFO_FILENAME)
        );

        $pdf->Output('F', $outputPath);

        return $outputPath;
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
}
