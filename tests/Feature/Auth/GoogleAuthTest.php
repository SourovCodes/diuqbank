<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery\MockInterface;

it('displays the login page', function () {
    $response = $this->get('/login');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('auth/login'));
});

it('redirects to google oauth', function () {
    $response = $this->get('/auth/google');

    $response->assertRedirect();
    expect($response->getTargetUrl())->toContain('accounts.google.com');
});

it('creates a new user on google callback when user does not exist', function () {
    $googleUser = mock(SocialiteUser::class, function (MockInterface $mock) {
        $mock->shouldReceive('getEmail')->andReturn('newuser@example.com');
        $mock->shouldReceive('getName')->andReturn('New User');
    });

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    expect(User::query()->where('email', 'newuser@example.com')->exists())->toBeFalse();

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('home'));

    expect(User::query()->where('email', 'newuser@example.com')->exists())->toBeTrue();

    $user = User::query()->where('email', 'newuser@example.com')->first();
    expect($user->name)->toBe('New User');
    expect($user->username)->not()->toBeEmpty();
    expect($user->email_verified_at)->not()->toBeNull();

    expect(Auth::check())->toBeTrue();
    expect(Auth::id())->toBe($user->id);
});

it('logs in existing user on google callback', function () {
    $existingUser = User::factory()->create([
        'email' => 'existing@example.com',
        'name' => 'Existing User',
    ]);

    $googleUser = mock(SocialiteUser::class, function (MockInterface $mock) {
        $mock->shouldReceive('getEmail')->andReturn('existing@example.com');
        $mock->shouldReceive('getName')->andReturn('Existing User');
    });

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    expect(Auth::check())->toBeFalse();

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('home'));

    expect(Auth::check())->toBeTrue();
    expect(Auth::id())->toBe($existingUser->id);

    // Should not create duplicate user
    expect(User::query()->where('email', 'existing@example.com')->count())->toBe(1);
});

it('generates unique username for new users', function () {
    User::factory()->create([
        'email' => 'test1@example.com',
        'username' => 'test',
    ]);

    $googleUser = mock(SocialiteUser::class, function (MockInterface $mock) {
        $mock->shouldReceive('getEmail')->andReturn('test@example.com');
        $mock->shouldReceive('getName')->andReturn('Test Example');
    });

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('home'));

    $newUser = User::query()->where('email', 'test@example.com')->first();
    expect($newUser->username)->toBe('test1');
});

it('generates username from email address', function () {
    $googleUser = mock(SocialiteUser::class, function (MockInterface $mock) {
        $mock->shouldReceive('getEmail')->andReturn('john.doe@example.com');
        $mock->shouldReceive('getName')->andReturn('John Doe');
    });

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('home'));

    $newUser = User::query()->where('email', 'john.doe@example.com')->first();
    expect($newUser->username)->toBe('johndoe');
});

it('marks email as verified for new google users', function () {
    $googleUser = mock(SocialiteUser::class, function (MockInterface $mock) {
        $mock->shouldReceive('getEmail')->andReturn('verified@example.com');
        $mock->shouldReceive('getName')->andReturn('Verified User');
    });

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('home'));

    $user = User::query()->where('email', 'verified@example.com')->first();
    expect($user->email_verified_at)->not()->toBeNull();
    expect($user->hasVerifiedEmail())->toBeTrue();
});
