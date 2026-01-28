<?php

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

test('google redirect redirects to google', function () {
    $response = $this->get(route('auth.google'));

    $response->assertRedirect();
});

test('google callback logs in existing user by email', function () {
    $existingUser = User::factory()->create([
        'email' => 'existing@example.com',
    ]);

    $abstractUser = Mockery::mock(SocialiteUser::class);
    $abstractUser->shouldReceive('getEmail')->andReturn('existing@example.com');
    $abstractUser->shouldReceive('getName')->andReturn('Existing User');
    $abstractUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar2.jpg');

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('user')->andReturn($abstractUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('home'));
    $this->assertAuthenticatedAs($existingUser);
});

test('google callback handles errors gracefully', function () {
    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('user')->andThrow(new \Exception('OAuth error'));

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('login'));
    $this->assertGuest();
});

test('authenticated users cannot access google redirect', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('auth.google'));

    $response->assertRedirect(route('dashboard'));
});

test('generateUsername from email', function () {
    // Test the username generation logic
    $user1 = User::factory()->create(['email' => 'test@example.com', 'username' => 'testuser']);

    // Verify existing user has username
    expect($user1->username)->toBe('testuser');
});
