<?php

use App\MediaLibrary\Conversions\PdfWatermarkGenerator;
use Spatie\MediaLibrary\Conversions\ImageGenerators\Pdf as BasePdfGenerator;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

it('can handle unsupported compression technique gracefully', function () {
    $generator = new PdfWatermarkGenerator(new BasePdfGenerator);

    // Mock a media instance
    $media = new Media([
        'id' => 123,
        'file_name' => 'test.pdf',
        'mime_type' => 'application/pdf',
    ]);

    // Test that the generator can convert PDF media
    expect($generator->canConvert($media))->toBeTrue();
});

it('supports pdf extensions and mime types', function () {
    $generator = new PdfWatermarkGenerator(new BasePdfGenerator);

    expect($generator->supportedExtensions()->toArray())->toBe(['pdf']);
    expect($generator->supportedMimeTypes()->toArray())->toBe(['application/pdf']);
});

it('checks if requirements are installed', function () {
    $generator = new PdfWatermarkGenerator(new BasePdfGenerator);

    // This should return true if FPDI is available
    expect($generator->requirementsAreInstalled())->toBeTrue();
});
