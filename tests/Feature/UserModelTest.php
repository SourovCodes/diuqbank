<?php

use App\Models\Submission;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('user has submissions relationship', function () {
    $user = User::factory()->create();
    $submissions = Submission::factory()->count(3)->create(['user_id' => $user->id]);

    expect($user->submissions)->toHaveCount(3);
    expect($user->submissions->first())->toBeInstanceOf(Submission::class);
});

test('user has votes relationship', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    Vote::factory()->count(2)->create(['user_id' => $user->id]);

    expect($user->votes)->toHaveCount(2);
    expect($user->votes->first())->toBeInstanceOf(Vote::class);
});

test('withContributorStats scope adds submissions count', function () {
    $user = User::factory()->create();
    Submission::factory()->count(5)->create(['user_id' => $user->id]);

    $userWithStats = User::withContributorStats()->find($user->id);

    expect($userWithStats->submissions_count)->toBe(5);
});

test('withContributorStats scope adds total votes', function () {
    $user = User::factory()->create();
    $submission1 = Submission::factory()->create(['user_id' => $user->id]);
    $submission2 = Submission::factory()->create(['user_id' => $user->id]);

    // Add votes to submissions
    Vote::factory()->create(['submission_id' => $submission1->id, 'value' => 1]);
    Vote::factory()->create(['submission_id' => $submission1->id, 'value' => 1]);
    Vote::factory()->create(['submission_id' => $submission2->id, 'value' => -1]);

    $userWithStats = User::withContributorStats()->find($user->id);

    expect((int) $userWithStats->total_votes)->toBe(1); // 1 + 1 - 1 = 1
});

test('withContributorStats scope adds total views', function () {
    $user = User::factory()->create();
    Submission::factory()->create(['user_id' => $user->id, 'views' => 100]);
    Submission::factory()->create(['user_id' => $user->id, 'views' => 50]);

    $userWithStats = User::withContributorStats()->find($user->id);

    expect((int) $userWithStats->submissions_sum_views)->toBe(150);
});

test('user avatar_url returns default when no avatar', function () {
    $user = User::factory()->create(['name' => 'John Doe']);

    expect($user->avatar_url)->toContain('ui-avatars.com');
    expect($user->avatar_url)->toContain(urlencode('John Doe'));
});

test('user avatar_url returns media url when avatar exists', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $user->addMedia(UploadedFile::fake()->image('avatar.jpg', 200, 200))
        ->toMediaCollection('avatar');

    expect($user->avatar_url)->toContain('avatar');
});

test('user media collection is single file', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    // Add first avatar
    $user->addMedia(UploadedFile::fake()->image('avatar1.jpg', 200, 200))
        ->toMediaCollection('avatar');

    // Add second avatar (should replace first)
    $user->addMedia(UploadedFile::fake()->image('avatar2.jpg', 200, 200))
        ->toMediaCollection('avatar');

    expect($user->getMedia('avatar'))->toHaveCount(1);
    expect($user->getFirstMedia('avatar')->file_name)->toBe('avatar2.jpg');
});

test('user implements HasMedia interface', function () {
    $user = User::factory()->create();

    expect($user)->toBeInstanceOf(\Spatie\MediaLibrary\HasMedia::class);
});

test('user implements MustVerifyEmail interface', function () {
    $user = User::factory()->create();

    expect($user)->toBeInstanceOf(\Illuminate\Contracts\Auth\MustVerifyEmail::class);
});

test('user password is hidden from serialization', function () {
    $user = User::factory()->create();
    $array = $user->toArray();

    expect($array)->not->toHaveKey('password');
    expect($array)->not->toHaveKey('remember_token');
});

test('user email_verified_at is cast to datetime', function () {
    $user = User::factory()->create(['email_verified_at' => '2025-01-15 10:00:00']);

    expect($user->email_verified_at)->toBeInstanceOf(\Carbon\CarbonImmutable::class);
});
