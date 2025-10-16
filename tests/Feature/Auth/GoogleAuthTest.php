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
        $mock->shouldReceive('getEmail')->andReturn('newuser@diu.edu.bd');
        $mock->shouldReceive('getName')->andReturn('New User');
    });

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    expect(User::query()->where('email', 'newuser@diu.edu.bd')->exists())->toBeFalse();

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('home'));

    expect(User::query()->where('email', 'newuser@diu.edu.bd')->exists())->toBeTrue();

    $user = User::query()->where('email', 'newuser@diu.edu.bd')->first();
    expect($user->name)->toBe('New User');
    expect($user->username)->not()->toBeEmpty();
    expect($user->email_verified_at)->not()->toBeNull();

    expect(Auth::check())->toBeTrue();
    expect(Auth::id())->toBe($user->id);
});

it('logs in existing user on google callback', function () {
    $existingUser = User::factory()->create([
        'email' => 'existing@diu.edu.bd',
        'name' => 'Existing User',
    ]);

    $googleUser = mock(SocialiteUser::class, function (MockInterface $mock) {
        $mock->shouldReceive('getEmail')->andReturn('existing@diu.edu.bd');
        $mock->shouldReceive('getName')->andReturn('Existing User');
    });

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    expect(Auth::check())->toBeFalse();

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('home'));

    expect(Auth::check())->toBeTrue();
    expect(Auth::id())->toBe($existingUser->id);

    // Should not create duplicate user
    expect(User::query()->where('email', 'existing@diu.edu.bd')->count())->toBe(1);
});

it('generates unique username for new users', function () {
    User::factory()->create([
        'email' => 'test1@diu.edu.bd',
        'username' => 'test',
    ]);

    $googleUser = mock(SocialiteUser::class, function (MockInterface $mock) {
        $mock->shouldReceive('getEmail')->andReturn('test@diu.edu.bd');
        $mock->shouldReceive('getName')->andReturn('Test Example');
    });

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('home'));

    $newUser = User::query()->where('email', 'test@diu.edu.bd')->first();
    expect($newUser->username)->toBe('test1');
});

it('generates username from email address', function () {
    $googleUser = mock(SocialiteUser::class, function (MockInterface $mock) {
        $mock->shouldReceive('getEmail')->andReturn('john.doe@s.diu.edu.bd');
        $mock->shouldReceive('getName')->andReturn('John Doe');
    });

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('home'));

    $newUser = User::query()->where('email', 'john.doe@s.diu.edu.bd')->first();
    expect($newUser->username)->toBe('johndoe');
});

it('marks email as verified for new google users', function () {
    $googleUser = mock(SocialiteUser::class, function (MockInterface $mock) {
        $mock->shouldReceive('getEmail')->andReturn('verified@diu.edu.bd');
        $mock->shouldReceive('getName')->andReturn('Verified User');
    });

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('home'));

    $user = User::query()->where('email', 'verified@diu.edu.bd')->first();
    expect($user->email_verified_at)->not()->toBeNull();
    expect($user->hasVerifiedEmail())->toBeTrue();
});

it('marks email as verified for existing users with unverified email', function () {
    $existingUser = User::factory()->create([
        'email' => 'unverified@s.diu.edu.bd',
        'name' => 'Unverified User',
        'email_verified_at' => null,
    ]);

    expect($existingUser->hasVerifiedEmail())->toBeFalse();

    $googleUser = mock(SocialiteUser::class, function (MockInterface $mock) {
        $mock->shouldReceive('getEmail')->andReturn('unverified@s.diu.edu.bd');
        $mock->shouldReceive('getName')->andReturn('Unverified User');
    });

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('home'));

    $existingUser->refresh();
    expect($existingUser->hasVerifiedEmail())->toBeTrue();
    expect($existingUser->email_verified_at)->not()->toBeNull();
});

it('logs out authenticated user', function () {
    $user = User::factory()->create();

    $this->actingAs($user);

    expect(Auth::check())->toBeTrue();

    $response = $this->post('/logout');

    $response->assertRedirect(route('home'));

    expect(Auth::check())->toBeFalse();
});

it('allows unauthenticated user to access logout', function () {
    expect(Auth::check())->toBeFalse();

    $response = $this->post('/logout');

    $response->assertRedirect(route('home'));

    expect(Auth::check())->toBeFalse();
});

it('rejects authentication with non-DIU email domains', function () {
    $googleUser = mock(SocialiteUser::class, function (MockInterface $mock) {
        $mock->shouldReceive('getEmail')->andReturn('user@gmail.com');
        $mock->shouldReceive('getName')->andReturn('External User');
    });

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('error', 'Only DIU email addresses (@diu.edu.bd or @s.diu.edu.bd) are allowed to register.');
    expect(User::query()->where('email', 'user@gmail.com')->exists())->toBeFalse();
});

it('rejects authentication with other educational domains', function () {
    $googleUser = mock(SocialiteUser::class, function (MockInterface $mock) {
        $mock->shouldReceive('getEmail')->andReturn('student@other.edu.bd');
        $mock->shouldReceive('getName')->andReturn('Other Student');
    });

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('error', 'Only DIU email addresses (@diu.edu.bd or @s.diu.edu.bd) are allowed to register.');
    expect(User::query()->where('email', 'student@other.edu.bd')->exists())->toBeFalse();
});
