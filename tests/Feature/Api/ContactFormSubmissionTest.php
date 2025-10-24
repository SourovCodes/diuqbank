<?php

use App\Models\ContactFormSubmission;

it('can submit a contact form', function () {
    $data = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'message' => 'This is a test message for the contact form.',
    ];

    $response = $this->postJson('/api/contact', $data);

    $response->assertCreated()
        ->assertJson([
            'message' => 'Thank you for contacting us! We will get back to you soon.',
        ]);

    $this->assertDatabaseHas('contact_form_submissions', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'message' => 'This is a test message for the contact form.',
    ]);
});

it('requires name field', function () {
    $response = $this->postJson('/api/contact', [
        'email' => 'john@example.com',
        'message' => 'This is a test message.',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

it('requires email field', function () {
    $response = $this->postJson('/api/contact', [
        'name' => 'John Doe',
        'message' => 'This is a test message.',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

it('requires valid email format', function () {
    $response = $this->postJson('/api/contact', [
        'name' => 'John Doe',
        'email' => 'invalid-email',
        'message' => 'This is a test message.',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

it('requires message field', function () {
    $response = $this->postJson('/api/contact', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['message']);
});

it('requires message to be at least 10 characters', function () {
    $response = $this->postJson('/api/contact', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'message' => 'Short',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['message']);
});

it('stores ip address and user agent', function () {
    $response = $this->withHeaders([
        'User-Agent' => 'Test Browser',
    ])->postJson('/api/contact', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'message' => 'This is a test message for the contact form.',
    ]);

    $response->assertCreated();

    $submission = ContactFormSubmission::latest()->first();

    expect($submission->ip_address)->not->toBeNull();
    expect($submission->user_agent)->toBe('Test Browser');
});

it('validates name max length', function () {
    $response = $this->postJson('/api/contact', [
        'name' => str_repeat('a', 256),
        'email' => 'john@example.com',
        'message' => 'This is a test message.',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

it('validates email max length', function () {
    $response = $this->postJson('/api/contact', [
        'name' => 'John Doe',
        'email' => str_repeat('a', 247).'@test.com', // 247 + 9 = 256, exceeds max
        'message' => 'This is a test message.',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

it('validates message max length', function () {
    $response = $this->postJson('/api/contact', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'message' => str_repeat('a', 5001),
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['message']);
});
