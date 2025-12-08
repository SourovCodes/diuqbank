<?php

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

it('authenticates user with valid google id token', function () {
    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->email = 'test@diu.edu.bd';
    $socialiteUser->name = 'Test User';

    Socialite::shouldReceive('driver->stateless->userFromToken')->andReturn($socialiteUser);

    $response = $this->postJson('/api/auth/google/mobile', [
        'id_token' => 'valid-google-id-token',
    ]);

    $response->assertSuccessful()
        ->assertJsonStructure([
            'user' => ['id', 'name', 'email', 'username'],
            'access_token',
            'token_type',
        ])
        ->assertJson([
            'user' => [
                'email' => 'test@diu.edu.bd',
                'name' => 'Test User',
            ],
            'token_type' => 'Bearer',
        ]);

    expect(User::where('email', 'test@diu.edu.bd')->exists())->toBeTrue();
});

it('creates new user if user does not exist', function () {
    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->email = 'newuser@s.diu.edu.bd';
    $socialiteUser->name = 'New User';

    Socialite::shouldReceive('driver->stateless->userFromToken')->andReturn($socialiteUser);

    expect(User::where('email', 'newuser@s.diu.edu.bd')->exists())->toBeFalse();

    $response = $this->postJson('/api/auth/google/mobile', [
        'id_token' => 'valid-google-id-token',
    ]);

    $response->assertSuccessful();

    $user = User::where('email', 'newuser@s.diu.edu.bd')->first();
    expect($user)->not->toBeNull();
    expect($user->name)->toBe('New User');
    expect($user->email_verified_at)->not->toBeNull();
});

it('uses existing user if user already exists', function () {
    $existingUser = User::factory()->create([
        'email' => 'existing@diu.edu.bd',
        'name' => 'Existing User',
    ]);

    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->email = 'existing@diu.edu.bd';
    $socialiteUser->name = 'Existing User';

    Socialite::shouldReceive('driver->stateless->userFromToken')->andReturn($socialiteUser);

    $response = $this->postJson('/api/auth/google/mobile', [
        'id_token' => 'valid-google-id-token',
    ]);

    $response->assertSuccessful()
        ->assertJson([
            'user' => [
                'id' => $existingUser->id,
                'email' => 'existing@diu.edu.bd',
            ],
        ]);

    expect(User::where('email', 'existing@diu.edu.bd')->count())->toBe(1);
});

it('rejects invalid google id token', function () {
    Socialite::shouldReceive('driver->stateless->userFromToken')
        ->andThrow(new \Exception('Invalid credentials'));

    $response = $this->postJson('/api/auth/google/mobile', [
        'id_token' => 'invalid-token',
    ]);

    $response->assertUnauthorized()
        ->assertJsonFragment([
            'message' => 'Failed to verify Google ID token.',
        ]);
});

it('rejects non-diu email addresses', function () {
    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->email = 'test@gmail.com';
    $socialiteUser->name = 'Test User';

    Socialite::shouldReceive('driver->stateless->userFromToken')->andReturn($socialiteUser);

    $response = $this->postJson('/api/auth/google/mobile', [
        'id_token' => 'valid-google-id-token',
    ]);

    $response->assertForbidden()
        ->assertJson([
            'message' => 'Only DIU email addresses (@diu.edu.bd or @s.diu.edu.bd) are allowed to register.',
        ]);
});

it('accepts diu.edu.bd email addresses', function () {
    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->email = 'test@diu.edu.bd';
    $socialiteUser->name = 'Test User';

    Socialite::shouldReceive('driver->stateless->userFromToken')->andReturn($socialiteUser);

    $response = $this->postJson('/api/auth/google/mobile', [
        'id_token' => 'valid-google-id-token',
    ]);

    $response->assertSuccessful();
});

it('accepts s.diu.edu.bd email addresses', function () {
    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->email = 'student@s.diu.edu.bd';
    $socialiteUser->name = 'Student User';

    Socialite::shouldReceive('driver->stateless->userFromToken')->andReturn($socialiteUser);

    $response = $this->postJson('/api/auth/google/mobile', [
        'id_token' => 'valid-google-id-token',
    ]);

    $response->assertSuccessful();
});

it('requires id_token field', function () {
    $response = $this->postJson('/api/auth/google/mobile', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['id_token']);
});

it('validates id_token is a string', function () {
    $response = $this->postJson('/api/auth/google/mobile', [
        'id_token' => 12345,
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['id_token']);
});

it('marks email as verified for new users', function () {
    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->email = 'verified@diu.edu.bd';
    $socialiteUser->name = 'Verified User';

    Socialite::shouldReceive('driver->stateless->userFromToken')->andReturn($socialiteUser);

    $this->postJson('/api/auth/google/mobile', [
        'id_token' => 'valid-google-id-token',
    ]);

    $user = User::where('email', 'verified@diu.edu.bd')->first();
    expect($user->hasVerifiedEmail())->toBeTrue();
});

it('returns sanctum access token', function () {
    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->email = 'token@diu.edu.bd';
    $socialiteUser->name = 'Token User';

    Socialite::shouldReceive('driver->stateless->userFromToken')->andReturn($socialiteUser);

    $response = $this->postJson('/api/auth/google/mobile', [
        'id_token' => 'valid-google-id-token',
    ]);

    $response->assertSuccessful();

    $token = $response->json('access_token');
    expect($token)->not->toBeNull();
    expect($token)->toBeString();

    // Verify token can be used to authenticate
    $authenticatedResponse = $this->withToken($token)
        ->getJson('/api/user');

    $authenticatedResponse->assertSuccessful();
});
