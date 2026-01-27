<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

beforeEach(function () {
    Notification::fake();
});

describe('registration', function () {
    it('can register a new user', function () {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'username', 'email', 'email_verified_at', 'created_at'],
                    'token',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'username' => 'testuser',
        ]);
    });

    it('sends email verification notification on registration', function () {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'test@example.com')->first();

        Notification::assertSentTo($user, VerifyEmail::class);
    });

    it('requires name, username, email, and password for registration', function () {
        $response = $this->postJson('/api/v1/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'username', 'email', 'password']);
    });

    it('requires unique email for registration', function () {
        User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    });

    it('requires password confirmation for registration', function () {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different_password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    });
});

describe('login', function () {
    it('can login with valid credentials', function () {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'username', 'email', 'email_verified_at', 'created_at'],
                    'token',
                ],
            ]);
    });

    it('cannot login with invalid credentials', function () {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials.']);
    });

    it('cannot login with non-existent email', function () {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials.']);
    });

    it('requires email and password for login', function () {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    });
});

describe('logout', function () {
    it('can logout authenticated user', function () {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(204);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    });

    it('cannot logout without authentication', function () {
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(401);
    });
});

describe('get user', function () {
    it('can get authenticated user', function () {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/user');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'username', 'email', 'email_verified_at', 'created_at'],
                ],
            ])
            ->assertJsonPath('data.user.id', $user->id);
    });

    it('cannot get user without authentication', function () {
        $response = $this->getJson('/api/v1/auth/user');

        $response->assertStatus(401);
    });
});

describe('email verification', function () {
    it('can send email verification notification', function () {
        $user = User::factory()->unverified()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/email/verification-notification');

        $response->assertStatus(204);

        Notification::assertSentTo($user, VerifyEmail::class);
    });

    it('returns user when email is already verified', function () {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/email/verification-notification');

        $response->assertStatus(200)
            ->assertJsonPath('data.user.id', $user->id);

        Notification::assertNotSentTo($user, VerifyEmail::class);
    });

    it('can verify email with valid signed url', function () {
        $user = User::factory()->unverified()->create();

        $verificationUrl = URL::temporarySignedRoute(
            'api.v1.verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())]
        );

        $response = $this->getJson($verificationUrl);

        $response->assertStatus(200)
            ->assertJsonPath('data.user.id', $user->id);

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    });

    it('cannot verify email with invalid hash', function () {
        $user = User::factory()->unverified()->create();

        $verificationUrl = URL::temporarySignedRoute(
            'api.v1.verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => 'invalid_hash']
        );

        $response = $this->getJson($verificationUrl);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Invalid verification link.']);

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    });

    it('returns user when verifying already verified email', function () {
        $user = User::factory()->create();

        $verificationUrl = URL::temporarySignedRoute(
            'api.v1.verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())]
        );

        $response = $this->getJson($verificationUrl);

        $response->assertStatus(200)
            ->assertJsonPath('data.user.id', $user->id);
    });

    it('cannot verify email with unsigned url', function () {
        $user = User::factory()->unverified()->create();

        $response = $this->getJson("/api/v1/auth/email/verify/{$user->id}/".sha1($user->getEmailForVerification()));

        $response->assertStatus(403);
    });
});
