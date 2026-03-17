<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Inertia\Testing\AssertableInertia as Assert;

// All password reset tests are skipped - using Google OAuth only
// These tests are kept for reference if password reset is re-enabled

test('forgot password page can be rendered', function () {
    $response = $this->get('/forgot-password');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/forgot-password')
    );
})->skip('Password reset disabled - using Google OAuth only');

test('password reset link can be requested', function () {
    Notification::fake();

    $user = User::factory()->create();

    $response = $this->post('/forgot-password', [
        'email' => $user->email,
    ]);

    Notification::assertSentTo($user, ResetPassword::class);
})->skip('Password reset disabled - using Google OAuth only');

test('password reset link request requires email', function () {
    $response = $this->post('/forgot-password', []);

    $response->assertSessionHasErrors('email');
})->skip('Password reset disabled - using Google OAuth only');

test('password reset link request requires valid email format', function () {
    $response = $this->post('/forgot-password', [
        'email' => 'not-an-email',
    ]);

    $response->assertSessionHasErrors('email');
})->skip('Password reset disabled - using Google OAuth only');

test('password reset link request fails for non-existent email', function () {
    Notification::fake();

    $response = $this->post('/forgot-password', [
        'email' => 'nonexistent@example.com',
    ]);

    // Laravel returns error for non-existent emails
    $response->assertSessionHasErrors('email');
    Notification::assertNothingSent();
})->skip('Password reset disabled - using Google OAuth only');

test('reset password page can be rendered with valid token', function () {
    $user = User::factory()->create();
    $token = Password::createToken($user);

    $response = $this->get("/reset-password/{$token}?email={$user->email}");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/reset-password')
        ->has('token')
        ->has('email')
    );
})->skip('Password reset disabled - using Google OAuth only');

test('password can be reset with valid token', function () {
    $user = User::factory()->create();
    $token = Password::createToken($user);

    $response = $this->post('/reset-password', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertRedirect('/login');

    expect(Hash::check('newpassword123', $user->fresh()->password))->toBeTrue();
})->skip('Password reset disabled - using Google OAuth only');

test('password reset requires token', function () {
    $user = User::factory()->create();

    $response = $this->post('/reset-password', [
        'email' => $user->email,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertSessionHasErrors('token');
})->skip('Password reset disabled - using Google OAuth only');

test('password reset requires email', function () {
    $user = User::factory()->create();
    $token = Password::createToken($user);

    $response = $this->post('/reset-password', [
        'token' => $token,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertSessionHasErrors('email');
})->skip('Password reset disabled - using Google OAuth only');

test('password reset requires password confirmation', function () {
    $user = User::factory()->create();
    $token = Password::createToken($user);

    $response = $this->post('/reset-password', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'newpassword123',
        'password_confirmation' => 'differentpassword',
    ]);

    $response->assertSessionHasErrors('password');
})->skip('Password reset disabled - using Google OAuth only');

test('password reset fails with invalid token', function () {
    $user = User::factory()->create([
        'password' => Hash::make('oldpassword'),
    ]);

    $response = $this->post('/reset-password', [
        'token' => 'invalid-token',
        'email' => $user->email,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertSessionHasErrors('email');

    // Password should remain unchanged
    expect(Hash::check('oldpassword', $user->fresh()->password))->toBeTrue();
})->skip('Password reset disabled - using Google OAuth only');

test('password reset fails with wrong email', function () {
    $user = User::factory()->create([
        'password' => Hash::make('oldpassword'),
    ]);
    $token = Password::createToken($user);

    $response = $this->post('/reset-password', [
        'token' => $token,
        'email' => 'wrong@example.com',
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertSessionHasErrors('email');

    // Password should remain unchanged
    expect(Hash::check('oldpassword', $user->fresh()->password))->toBeTrue();
})->skip('Password reset disabled - using Google OAuth only');
