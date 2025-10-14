<?php

namespace App\MediaLibrary\Conversions;

use Illuminate\Support\Collection;
use Spatie\MediaLibrary\Conversions\Conversion;
use Spatie\MediaLibrary\Conversions\ImageGenerators\ImageGenerator;
use Spatie\MediaLibrary\Conversions\ImageGenerators\Pdf as BasePdfGenerator;

class PdfWatermarkImageGenerator extends ImageGenerator
{
    public function __construct(
        protected BasePdfGenerator $fallback
    ) {}

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
        $imagickClass = 'Imagick';
        $drawClass = 'ImagickDraw';
        $pixelClass = 'ImagickPixel';

        if (! class_exists($imagickClass) || ! class_exists($drawClass) || ! class_exists($pixelClass)) {
            throw new \RuntimeException('Imagick extension is required to generate watermarked PDFs.');
        }

        $imagick = new $imagickClass;
        $imagick->setResolution(150, 150);
        $imagick->readImage($file);

        $draw = new $drawClass;
        $draw->setFillColor(new $pixelClass('rgba(0, 0, 0, 0.15)'));
        $draw->setStrokeColor(new $pixelClass('rgba(0, 0, 0, 0.05)'));
        $draw->setStrokeWidth(1);
        $draw->setFontSize(42);
        $draw->setGravity(constant($imagickClass.'::GRAVITY_CENTER'));

        $watermarkText = sprintf('%s • Watermarked', config('app.name', 'DIUQBank'));

        foreach ($imagick as $page) {
            $page->setImageAlphaChannel(constant($imagickClass.'::ALPHACHANNEL_ACTIVATE'));
            $page->annotateImage($draw, 0, 0, 45, $watermarkText);
        }

        $outputPath = sprintf(
            '%s/%s-watermarked.pdf',
            pathinfo($file, PATHINFO_DIRNAME),
            pathinfo($file, PATHINFO_FILENAME)
        );

        $imagick->setImageFormat('pdf');
        $imagick->writeImages($outputPath, true);

        $imagick->clear();
        $imagick->destroy();

        return $outputPath;
    }

    public function requirementsAreInstalled(): bool
    {
        return class_exists('Imagick') && class_exists('ImagickDraw') && class_exists('ImagickPixel');
    }

    public function supportedExtensions(): Collection
    {
        return collect(['pdf']);
    }

    public function supportedMimeTypes(): Collection
    {
        return collect(['application/pdf']);
    }
}
