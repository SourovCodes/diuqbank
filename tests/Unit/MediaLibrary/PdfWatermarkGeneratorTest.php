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

    $watermarkText = $generator->exposedResolveWatermarkText();

    expect($watermarkText)
        ->toContain('Uploader Name')
        ->toContain('https://diuqbank.com')
        ->toContain('For more questions:');
});
