<?php

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;

test('guest cannot access email verification notice page', function () {
    $response = $this->get('/email/verify');

    $response->assertRedirect('/login');
});

test('unverified user can view verification notice page', function () {
    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)->get('/email/verify');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/verify-email')
    );
});

test('verified user is redirected from verification notice page', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);

    $response = $this->actingAs($user)->get('/email/verify');

    $response->assertRedirect(route('dashboard'));
});

test('email can be verified', function () {
    Event::fake();

    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    Event::assertDispatched(Verified::class);
    $response->assertRedirect(route('dashboard'));
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('email verification requires valid signature', function () {
    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    // Tamper with the URL
    $tamperedUrl = $verificationUrl.'&tampered=true';

    $response = $this->actingAs($user)->get($tamperedUrl);

    $response->assertStatus(403);
    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('email verification requires correct hash', function () {
    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => 'wrong-hash']
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    $response->assertStatus(403);
    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('verification notification can be resent', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)->post('/email/verification-notification');

    Notification::assertSentTo($user, VerifyEmail::class);
    $response->assertRedirect();
});

test('verified user cannot resend verification notification', function () {
    Notification::fake();

    $user = User::factory()->create(['email_verified_at' => now()]);

    $response = $this->actingAs($user)->post('/email/verification-notification');

    Notification::assertNothingSent();
    $response->assertRedirect(route('dashboard'));
});

test('verification notification is throttled', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    // Send 6 requests
    for ($i = 0; $i < 6; $i++) {
        $this->actingAs($user)->post('/email/verification-notification');
    }

    // 7th request should be throttled
    $response = $this->actingAs($user)->post('/email/verification-notification');

    $response->assertStatus(429);
});

test('guest cannot resend verification notification', function () {
    $response = $this->post('/email/verification-notification');

    $response->assertRedirect('/login');
});
