<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;

it('clears avatar cache when profile picture is updated', function () {
    Storage::fake('local');
    Storage::fake('profile-pictures');

    $user = User::factory()->create();

    // Cache the avatar URL
    $cacheKey = "user.{$user->id}.avatar";
    Cache::put($cacheKey, 'https://example.com/old-avatar.jpg', now()->addDay());

    // Verify cache exists
    expect(Cache::has($cacheKey))->toBeTrue();

    // Create a fake image file
    $file = UploadedFile::fake()->image('avatar.jpg');

    // Update profile picture
    actingAs($user)->post(route('profile.image.update'), [
        'avatar' => $file,
    ])->assertRedirect();

    // Verify cache was cleared
    expect(Cache::has($cacheKey))->toBeFalse();
});

it('can update profile information', function () {
    $user = User::factory()->create([
        'name' => 'Old Name',
        'username' => 'oldusername',
        'student_id' => '12345',
    ]);

    actingAs($user)->put(route('profile.update'), [
        'name' => 'New Name',
        'username' => 'newusername',
        'student_id' => '67890',
    ])->assertRedirect()
        ->assertSessionHas('success', 'Profile updated successfully!');

    $user->refresh();

    expect($user->name)->toBe('New Name')
        ->and($user->username)->toBe('newusername')
        ->and($user->student_id)->toBe('67890');
});

it('can view profile edit page', function () {
    $user = User::factory()->create();

    actingAs($user)->get(route('profile.edit'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('profile/edit')
            ->has('user', fn ($user_data) => $user_data
                ->where('id', $user->id)
                ->where('name', $user->name)
                ->where('email', $user->email)
                ->where('username', $user->username)
                ->where('student_id', $user->student_id)
                ->etc()
            )
        );
});
