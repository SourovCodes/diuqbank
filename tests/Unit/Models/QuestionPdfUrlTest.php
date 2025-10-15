<?php

use App\Models\Question;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

afterEach(function (): void {
    \Mockery::close();
});

function questionWithMedia(?Media $media): Question
{
    $question = new class extends Question
    {
        public ?Media $media = null;

        public function getFirstMedia(string $collectionName = 'default', $filters = []): ?Media
        {
            return $this->media;
        }
    };

    $question->media = $media;

    return $question;
}

it('returns the watermarked conversion url when available', function (): void {
    $media = \Mockery::mock(Media::class);
    $media->shouldReceive('hasGeneratedConversion')->once()->with('watermarked')->andReturnTrue();
    $media->shouldReceive('getFullUrl')->once()->with('watermarked')->andReturn('https://cdn.example/watermarked.pdf');

    $question = questionWithMedia($media);

    expect($question->pdf_url)->toBe('https://cdn.example/watermarked.pdf');
});

it('returns the temporary url when the conversion is missing', function (): void {
    $media = \Mockery::mock(Media::class);
    $media->shouldReceive('hasGeneratedConversion')->once()->with('watermarked')->andReturnFalse();
    $media->shouldReceive('getAttribute')->with('disk')->andReturn('s3');
    $media->shouldReceive('getTemporaryUrl')->once()->with(\Mockery::type(\DateTimeInterface::class))->andReturn('https://private.example/temp.pdf');

    $question = questionWithMedia($media);

    expect($question->pdf_url)->toBe('https://private.example/temp.pdf');
});

it('falls back to the original url when a temporary url cannot be generated', function (): void {
    $media = \Mockery::mock(Media::class);
    $media->shouldReceive('hasGeneratedConversion')->once()->with('watermarked')->andReturnFalse();
    $media->shouldReceive('getAttribute')->with('disk')->andReturn('s3');
    $media->shouldReceive('getTemporaryUrl')->once()->with(\Mockery::type(\DateTimeInterface::class))->andThrow(new \RuntimeException('temporary urls unavailable'));
    $media->shouldReceive('getFullUrl')->once()->withNoArgs()->andReturn('https://private.example/original.pdf');

    $question = questionWithMedia($media);

    expect($question->pdf_url)->toBe('https://private.example/original.pdf');
});

it('returns null when there is no attached pdf', function (): void {
    $question = questionWithMedia(null);

    expect($question->pdf_url)->toBeNull();
});
