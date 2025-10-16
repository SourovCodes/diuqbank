<?php

use App\Models\ContactFormSubmission as ContactFormSubmissionModel;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('creates a contact form submission', function () {
    $data = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'message' => 'This is a test message for the contact form.',
    ];

    $response = $this->post(route('contact.submit'), $data);

    $response->assertRedirect(route('contact'));
    $response->assertSessionHas('success', 'Message sent successfully.');

    // Assert submission was created in database
    expect(ContactFormSubmissionModel::where('email', 'john@example.com')->exists())->toBeTrue();

    $submission = ContactFormSubmissionModel::where('email', 'john@example.com')->first();
    expect($submission->name)->toBe('John Doe');
    expect($submission->message)->toBe('This is a test message for the contact form.');
    expect($submission->ip_address)->not->toBeNull();
});

it('validates required fields', function () {
    $response = $this->post(route('contact.submit'), []);

    $response->assertSessionHasErrors(['name', 'email', 'message']);
});

it('validates email format', function () {
    $data = [
        'name' => 'John Doe',
        'email' => 'invalid-email',
        'message' => 'This is a test message.',
    ];

    $response = $this->post(route('contact.submit'), $data);

    $response->assertSessionHasErrors(['email']);
});

it('validates minimum message length', function () {
    $data = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'message' => 'Short',
    ];

    $response = $this->post(route('contact.submit'), $data);

    $response->assertSessionHasErrors(['message']);
});
