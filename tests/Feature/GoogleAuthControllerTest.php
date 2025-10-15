<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

uses(RefreshDatabase::class);

it('allows authentication with @diu.edu.bd email', function () {
    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getEmail')->andReturn('student@diu.edu.bd');
    $socialiteUser->shouldReceive('getName')->andReturn('John Doe');

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get('/auth/google/callback');

    expect(User::where('email', 'student@diu.edu.bd')->exists())->toBeTrue();
    $response->assertRedirect(route('home'));
});

it('allows authentication with @s.diu.edu.bd email', function () {
    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getEmail')->andReturn('student@s.diu.edu.bd');
    $socialiteUser->shouldReceive('getName')->andReturn('Jane Doe');

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get('/auth/google/callback');

    expect(User::where('email', 'student@s.diu.edu.bd')->exists())->toBeTrue();
    $response->assertRedirect(route('home'));
});

it('rejects authentication with non-DIU email', function () {
    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getEmail')->andReturn('student@gmail.com');
    $socialiteUser->shouldReceive('getName')->andReturn('External User');

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get('/auth/google/callback');

    expect(User::where('email', 'student@gmail.com')->exists())->toBeFalse();
    $response->assertRedirect(route('login'));
    $response->assertSessionHasErrors(['email']);
});

it('rejects authentication with other educational domain', function () {
    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getEmail')->andReturn('student@other.edu.bd');
    $socialiteUser->shouldReceive('getName')->andReturn('Other Student');

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get('/auth/google/callback');

    expect(User::where('email', 'student@other.edu.bd')->exists())->toBeFalse();
    $response->assertRedirect(route('login'));
    $response->assertSessionHasErrors(['email']);
});

it('authenticates existing user with valid DIU email', function () {
    $existingUser = User::factory()->create([
        'email' => 'existing@diu.edu.bd',
        'name' => 'Existing User',
    ]);

    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getEmail')->andReturn('existing@diu.edu.bd');
    $socialiteUser->shouldReceive('getName')->andReturn('Existing User Updated');

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('home'));
    $this->assertAuthenticatedAs($existingUser);
});
