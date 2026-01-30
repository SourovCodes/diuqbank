<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

test('register page can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/register')
    );
});

test('authenticated user is redirected from register page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/register');

    $response->assertRedirect('/dashboard');
});

test('user can register with valid DIU email', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'username' => 'testuser',
        'email' => 'testuser@diu.edu.bd',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertRedirect('/');
    $this->assertAuthenticated();

    $this->assertDatabaseHas('users', [
        'name' => 'Test User',
        'username' => 'testuser',
        'email' => 'testuser@diu.edu.bd',
    ]);
});

test('user can register with student DIU email', function () {
    $response = $this->post('/register', [
        'name' => 'Student User',
        'username' => 'studentuser',
        'email' => 'student@s.diu.edu.bd',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertRedirect('/');
    $this->assertAuthenticated();

    $this->assertDatabaseHas('users', [
        'email' => 'student@s.diu.edu.bd',
    ]);
});

test('user cannot register with non-DIU email', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'username' => 'testuser',
        'email' => 'testuser@gmail.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('registration requires name', function () {
    $response = $this->post('/register', [
        'username' => 'testuser',
        'email' => 'testuser@diu.edu.bd',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors('name');
});

test('registration requires username', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'testuser@diu.edu.bd',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors('username');
});

test('registration requires unique username', function () {
    User::factory()->create(['username' => 'existinguser']);

    $response = $this->post('/register', [
        'name' => 'Test User',
        'username' => 'existinguser',
        'email' => 'testuser@diu.edu.bd',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors('username');
});

test('registration requires unique email', function () {
    User::factory()->create(['email' => 'existing@diu.edu.bd']);

    $response = $this->post('/register', [
        'name' => 'Test User',
        'username' => 'newuser',
        'email' => 'existing@diu.edu.bd',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors('email');
});

test('registration requires password confirmation', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'username' => 'testuser',
        'email' => 'testuser@diu.edu.bd',
        'password' => 'password123',
        'password_confirmation' => 'differentpassword',
    ]);

    $response->assertSessionHasErrors('password');
});

test('registration requires minimum password length', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'username' => 'testuser',
        'email' => 'testuser@diu.edu.bd',
        'password' => 'short',
        'password_confirmation' => 'short',
    ]);

    $response->assertSessionHasErrors('password');
});

test('registered user password is hashed', function () {
    $this->post('/register', [
        'name' => 'Test User',
        'username' => 'testuser',
        'email' => 'testuser@diu.edu.bd',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $user = User::where('email', 'testuser@diu.edu.bd')->first();

    expect(Hash::check('password123', $user->password))->toBeTrue();
    expect($user->password)->not->toBe('password123');
});
