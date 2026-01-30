<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guest cannot access profile page', function () {
    $response = $this->get('/dashboard/profile');

    $response->assertRedirect('/login');
});

test('authenticated user can view profile page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard/profile');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard/profile')
        ->has('user')
        ->where('user.id', $user->id)
        ->where('user.name', $user->name)
        ->has('user.avatar_url')
    );
});

test('guest cannot upload avatar', function () {
    $response = $this->post('/dashboard/profile/avatar', [
        'avatar' => UploadedFile::fake()->image('avatar.jpg'),
    ]);

    $response->assertRedirect('/login');
});

test('authenticated user can upload avatar', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/dashboard/profile/avatar', [
        'avatar' => UploadedFile::fake()->image('avatar.jpg', 200, 200),
    ]);

    $response->assertRedirect();
    expect($user->fresh()->getFirstMedia('avatar'))->not->toBeNull();
});

test('avatar upload requires an image file', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/dashboard/profile/avatar', [
        'avatar' => UploadedFile::fake()->create('document.pdf', 100),
    ]);

    $response->assertSessionHasErrors('avatar');
});

test('avatar upload rejects files larger than 5MB', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/dashboard/profile/avatar', [
        'avatar' => UploadedFile::fake()->image('avatar.jpg')->size(6000),
    ]);

    $response->assertSessionHasErrors('avatar');
});

test('avatar is required for upload', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/dashboard/profile/avatar', []);

    $response->assertSessionHasErrors('avatar');
});

test('user avatar_url returns uploaded avatar', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $user->addMedia(UploadedFile::fake()->image('avatar.jpg', 200, 200))
        ->toMediaCollection('avatar');

    expect($user->avatar_url)->toContain('avatar');
});

test('user avatar_url returns default avatar when no avatar uploaded', function () {
    $user = User::factory()->create(['name' => 'John Doe']);

    expect($user->avatar_url)->toContain('ui-avatars.com');
    expect($user->avatar_url)->toContain(urlencode('John Doe'));
});
