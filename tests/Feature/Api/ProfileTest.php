<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
    Storage::fake('profile-pictures');
});

it('can update user profile', function () {
    $user = User::factory()->create([
        'name' => 'Old Name',
        'username' => 'oldusername',
        'student_id' => '123456',
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->putJson('/api/profile', [
            'name' => 'New Name',
            'username' => 'newusername',
            'student_id' => '654321',
        ]);

    $response->assertSuccessful()
        ->assertJson([
            'data' => [
                'name' => 'New Name',
                'username' => 'newusername',
            ],
            'message' => 'Profile updated successfully!',
        ]);

    $user->refresh();
    expect($user->name)->toBe('New Name');
    expect($user->username)->toBe('newusername');
    expect($user->student_id)->toBe('654321');
});

it('requires authentication to update profile', function () {
    $response = $this->putJson('/api/profile', [
        'name' => 'New Name',
        'username' => 'newusername',
    ]);

    $response->assertUnauthorized();
});

it('validates required fields for profile update', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->putJson('/api/profile', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'username']);
});

it('validates username uniqueness', function () {
    $existingUser = User::factory()->create(['username' => 'takenusername']);
    $user = User::factory()->create(['username' => 'myusername']);

    $response = $this->actingAs($user, 'sanctum')
        ->putJson('/api/profile', [
            'name' => 'Test User',
            'username' => 'takenusername',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['username']);
});

it('allows keeping same username when updating profile', function () {
    $user = User::factory()->create([
        'name' => 'Test User',
        'username' => 'myusername',
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->putJson('/api/profile', [
            'name' => 'Updated Name',
            'username' => 'myusername',
        ]);

    $response->assertSuccessful();
});

it('validates username format', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->putJson('/api/profile', [
            'name' => 'Test User',
            'username' => 'invalid username!',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['username']);
});

it('can update profile picture with image file', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->image('avatar.jpg');

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/profile/image', [
            'avatar' => $file,
        ]);

    $response->assertSuccessful()
        ->assertJson([
            'message' => 'Profile picture updated successfully!',
        ]);

    expect($user->hasMedia('profile_picture'))->toBeTrue();
});

it('requires authentication to update profile picture', function () {
    $file = UploadedFile::fake()->image('avatar.jpg');

    $response = $this->postJson('/api/profile/image', [
        'avatar' => $file,
    ]);

    $response->assertUnauthorized();
});

it('validates avatar is required for profile picture update', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/profile/image', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['avatar']);
});

it('removes old profile picture when uploading new one', function () {
    $user = User::factory()->create();

    // Upload first image
    $file1 = UploadedFile::fake()->image('avatar1.jpg');

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/profile/image', [
            'avatar' => $file1,
        ]);

    expect($user->hasMedia('profile_picture'))->toBeTrue();
    $firstMediaCount = $user->getMedia('profile_picture')->count();

    // Upload second image
    $file2 = UploadedFile::fake()->image('avatar2.png');

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/profile/image', [
            'avatar' => $file2,
        ]);

    $user->refresh();
    expect($user->getMedia('profile_picture')->count())->toBe($firstMediaCount);
});

it('allows nullable student_id', function () {
    $user = User::factory()->create([
        'student_id' => '123456',
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->putJson('/api/profile', [
            'name' => 'Test User',
            'username' => 'testuser',
            'student_id' => null,
        ]);

    $response->assertSuccessful();

    $user->refresh();
    expect($user->student_id)->toBeNull();
});

it('clears avatar cache when updating profile picture', function () {
    $user = User::factory()->create();

    // Set a cached avatar URL with a specific old value
    $oldCachedUrl = 'https://example.com/old-avatar.jpg';
    cache()->put("user.{$user->id}.avatar", $oldCachedUrl, now()->addDay());

    expect(cache()->get("user.{$user->id}.avatar"))->toBe($oldCachedUrl);

    $file = UploadedFile::fake()->image('avatar.jpg');

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/profile/image', [
            'avatar' => $file,
        ]);

    // The old cached value should be cleared (either no cache or different value)
    $newCachedValue = cache()->get("user.{$user->id}.avatar");
    expect($newCachedValue)->not->toBe($oldCachedUrl);
});

it('validates avatar must be an image', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->create('document.pdf', 100);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/profile/image', [
            'avatar' => $file,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['avatar']);
});

it('validates avatar file size limit', function () {
    $user = User::factory()->create();

    // Create a file larger than 2MB (2048KB)
    $file = UploadedFile::fake()->image('avatar.jpg')->size(3000);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/profile/image', [
            'avatar' => $file,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['avatar']);
});

it('validates avatar file mime types', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->create('avatar.bmp', 100, 'image/bmp');

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/profile/image', [
            'avatar' => $file,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['avatar']);
});
