<?php

use App\Models\ContactFormSubmission;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('creates a contact form submission when submitted', function () {
    $payload = [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'message' => 'Hello world. Hello world.',
    ];

    $response = $this->post('/contact', $payload);

    $response->assertRedirect(route('contact'));
    $response->assertSessionHas('success', 'Message sent successfully.');

    // Assert submission was created in database
    expect(ContactFormSubmission::where('email', 'jane@example.com')->exists())->toBeTrue();

    $submission = ContactFormSubmission::where('email', 'jane@example.com')->first();
    expect($submission->name)->toBe($payload['name']);
    expect($submission->email)->toBe($payload['email']);
    expect($submission->message)->toBe($payload['message']);
});

it('validates contact form input', function (array $payload, array $expectedErrors) {
    $response = $this->from(route('contact'))->post('/contact', $payload);

    $response->assertRedirect(route('contact'));
    $response->assertSessionHasErrors($expectedErrors);

    // Assert no submission was created
    expect(ContactFormSubmission::count())->toBe(0);
})->with([
    'missing name' => [
        [
            'name' => '',
            'email' => 'jane@example.com',
            'message' => str_repeat('Helpful feedback ', 3),
        ],
        ['name'],
    ],
    'invalid email' => [
        [
            'name' => 'Jane Doe',
            'email' => 'invalid-email',
            'message' => str_repeat('Helpful feedback ', 3),
        ],
        ['email'],
    ],
    'message too short' => [
        [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'message' => 'Too short',
        ],
        ['message'],
    ],
]);
