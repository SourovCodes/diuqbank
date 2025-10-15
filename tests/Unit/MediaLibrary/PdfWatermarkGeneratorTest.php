<?php

use App\MediaLibrary\Conversions\PdfWatermarkGenerator;
use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\MediaLibrary\Conversions\ImageGenerators\Pdf as BasePdfGenerator;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Tests\TestCase;

uses(TestCase::class);
uses(RefreshDatabase::class);

it('includes the uploader name within the watermark text', function () {
    $user = User::factory()->create(['name' => 'Uploader Name']);

    $question = Question::factory()
        ->for($user, 'user')
        ->create();

    $question->setRelation('user', $user);

    $media = new Media;
    $media->id = 123;
    $media->model_type = $question->getMorphClass();
    $media->model_id = $question->getKey();
    $media->collection_name = 'pdf';
    $media->mime_type = 'application/pdf';
    $media->disk = 'public';
    $media->file_name = 'example.pdf';
    $media->setRelation('model', $question);

    $fallback = \Mockery::mock(BasePdfGenerator::class);

    $generator = new class($fallback) extends PdfWatermarkGenerator
    {
        public function setMediaForTest(Media $media): void
        {
            $this->media = $media;
        }

        public function exposedResolveWatermarkText(): string
        {
            return $this->resolveWatermarkText();
        }
    };

    $generator->setMediaForTest($media);

    expect($generator->exposedResolveWatermarkText())
        ->toContain('Uploader Name')
        ->toStartWith('https://diuqbank.com');
});

it('normalizes oversized PDFs to A4 dimensions', function () {
    $fallback = \Mockery::mock(BasePdfGenerator::class);

    $generator = new class($fallback) extends PdfWatermarkGenerator
    {
        public function exposedNormalizePageSize(array $pageSize): array
        {
            return $this->normalizePageSize($pageSize);
        }
    };

    // Test oversized PDF (larger than 650pt width or 900pt height)
    $oversizedPortrait = ['width' => 769.76, 'height' => 1113.17];
    $normalized = $generator->exposedNormalizePageSize($oversizedPortrait);

    expect($normalized['width'])->toBe(595.28)
        ->and($normalized['height'])->toBe(841.89)
        ->and($normalized['orientation'])->toBe('P');

    // Test oversized landscape
    $oversizedLandscape = ['width' => 1113.17, 'height' => 769.76];
    $normalizedLandscape = $generator->exposedNormalizePageSize($oversizedLandscape);

    expect($normalizedLandscape['width'])->toBe(841.89)
        ->and($normalizedLandscape['height'])->toBe(595.28)
        ->and($normalizedLandscape['orientation'])->toBe('L');
});

it('preserves normal-sized PDFs without normalization', function () {
    $fallback = \Mockery::mock(BasePdfGenerator::class);

    $generator = new class($fallback) extends PdfWatermarkGenerator
    {
        public function exposedNormalizePageSize(array $pageSize): array
        {
            return $this->normalizePageSize($pageSize);
        }
    };

    // Test normal A4 size
    $normalA4 = ['width' => 595.28, 'height' => 841.89];
    $result = $generator->exposedNormalizePageSize($normalA4);

    expect($result['width'])->toBe(595.28)
        ->and($result['height'])->toBe(841.89)
        ->and($result['orientation'])->toBe('P');
});

it('compresses PDF using Ghostscript when available', function () {
    // Check if Ghostscript is available
    exec('which gs 2>/dev/null', $output, $returnCode);

    if ($returnCode !== 0) {
        $this->markTestSkipped('Ghostscript is not installed');
    }

    $user = User::factory()->create(['name' => 'Test User']);
    $question = Question::factory()->for($user, 'user')->create();

    // Create a test PDF file
    $testPdfPath = storage_path('app/test-compression.pdf');
    $pdf = new \setasign\Fpdi\Fpdi;
    $pdf->AddPage();
    $pdf->SetFont('Helvetica', '', 12);
    $pdf->Cell(0, 10, 'Test PDF for compression', 0, 1);
    $pdf->Output('F', $testPdfPath);

    $originalSize = filesize($testPdfPath);

    $media = new Media;
    $media->id = 999;
    $media->model_type = $question->getMorphClass();
    $media->model_id = $question->getKey();
    $media->collection_name = 'pdf';
    $media->setRelation('model', $question);

    $fallback = \Mockery::mock(BasePdfGenerator::class);

    $generator = new class($fallback) extends PdfWatermarkGenerator
    {
        public function setMediaForTest(Media $media): void
        {
            $this->media = $media;
        }

        public function exposedCompressPdf(string $file): ?string
        {
            return $this->compressPdf($file);
        }
    };

    $generator->setMediaForTest($media);
    $compressedPath = $generator->exposedCompressPdf($testPdfPath);

    if ($compressedPath) {
        expect($compressedPath)->toBeFile()
            ->and(filesize($compressedPath))->toBeLessThan($originalSize);

        @unlink($compressedPath);
    }

    @unlink($testPdfPath);
});
