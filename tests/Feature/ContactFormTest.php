<?php

use App\Mail\ContactFormSubmission;
use Illuminate\Support\Facades\Mail;

it('sends an email when the contact form is submitted', function () {
    Mail::fake();

    $payload = [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'message' => 'Hello world. Hello world.',
    ];

    $response = $this->post('/contact', $payload);

    $response->assertRedirect(route('contact'));
    $response->assertSessionHas('success', 'Message sent successfully.');

    Mail::assertSent(ContactFormSubmission::class);

    /** @var ContactFormSubmission $sentMail */
    $sentMail = Mail::sent(ContactFormSubmission::class)->first();

    expect($sentMail)->toBeInstanceOf(ContactFormSubmission::class);
    expect($sentMail->hasTo('contact-form-submissions@diuqbank.com'))->toBeTrue();
    expect($sentMail->hasReplyTo($payload['email']))->toBeTrue();
    expect($sentMail->name)->toBe($payload['name']);
    expect($sentMail->email)->toBe($payload['email']);
    expect($sentMail->messageBody)->toBe($payload['message']);
});

it('validates contact form input', function (array $payload, array $expectedErrors) {
    Mail::fake();

    $response = $this->from(route('contact'))->post('/contact', $payload);

    $response->assertRedirect(route('contact'));
    $response->assertSessionHasErrors($expectedErrors);

    Mail::assertNothingSent();
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
