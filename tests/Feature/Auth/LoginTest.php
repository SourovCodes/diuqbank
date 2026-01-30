<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

test('login page can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/login')
    );
});

test('authenticated user is redirected from login page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/login');

    $response->assertRedirect('/dashboard');
});

test('user can login with valid credentials', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password123',
    ]);

    $response->assertRedirect();
    $this->assertAuthenticatedAs($user);
});

test('user cannot login with invalid password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrongpassword',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('user cannot login with non-existent email', function () {
    $response = $this->post('/login', [
        'email' => 'nonexistent@example.com',
        'password' => 'password123',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('login requires email', function () {
    $response = $this->post('/login', [
        'password' => 'password123',
    ]);

    $response->assertSessionHasErrors('email');
});

test('login requires password', function () {
    $response = $this->post('/login', [
        'email' => 'test@example.com',
    ]);

    $response->assertSessionHasErrors('password');
});

test('user can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $response->assertRedirect('/');
    $this->assertGuest();
});

test('login is rate limited after too many attempts', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    // Make 5 failed login attempts
    for ($i = 0; $i < 5; $i++) {
        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrongpassword',
        ]);
    }

    // 6th attempt should be rate limited
    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrongpassword',
    ]);

    $response->assertSessionHasErrors('email');
    expect(session('errors')->get('email')[0])->toContain('Too many login attempts');
});

test('user can login with remember me option', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password123',
        'remember' => true,
    ]);

    $response->assertRedirect();
    $this->assertAuthenticatedAs($user);

    // Check that remember token is set
    expect($user->fresh()->remember_token)->not->toBeNull();
});
