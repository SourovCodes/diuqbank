<?php

use App\Models\Submission;

it('increments view count on first view', function () {
    $submission = Submission::factory()->create(['views' => 5]);

    $response = $this->post(route('submissions.view', $submission));

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'views' => 6,
            'already_viewed' => false,
        ]);

    expect($submission->fresh()->views)->toBe(6);
});

it('does not increment view count on subsequent views in same session', function () {
    $submission = Submission::factory()->create(['views' => 5]);

    // First view
    $this->post(route('submissions.view', $submission))
        ->assertJson(['already_viewed' => false, 'views' => 6]);

    // Second view in same session
    $response = $this->post(route('submissions.view', $submission));

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'views' => 6,
            'already_viewed' => true,
        ]);

    expect($submission->fresh()->views)->toBe(6);
});

it('tracks views separately for different submissions', function () {
    $submission1 = Submission::factory()->create(['views' => 10]);
    $submission2 = Submission::factory()->create(['views' => 20]);

    $this->post(route('submissions.view', $submission1))
        ->assertJson(['views' => 11, 'already_viewed' => false]);

    $this->post(route('submissions.view', $submission2))
        ->assertJson(['views' => 21, 'already_viewed' => false]);

    // Viewing submission1 again should not increment
    $this->post(route('submissions.view', $submission1))
        ->assertJson(['views' => 11, 'already_viewed' => true]);
});

it('works for a single submission question', function () {
    $submission = Submission::factory()->create(['views' => 0]);

    // First view should increment
    $this->post(route('submissions.view', $submission))
        ->assertOk()
        ->assertJson([
            'success' => true,
            'views' => 1,
            'already_viewed' => false,
        ]);

    expect($submission->fresh()->views)->toBe(1);
});

it('is rate limited', function () {
    // The route has a 60,1 throttle (60 requests per minute)
    // Create a single submission and hit it many times
    // Note: session tracking will only count first view, but throttle still applies
    $submission = Submission::factory()->create(['views' => 0]);

    for ($i = 0; $i < 61; $i++) {
        $response = $this->post(route('submissions.view', $submission));

        if ($i < 60) {
            $response->assertOk();
        } else {
            $response->assertStatus(429);
        }
    }
})->skip('Rate limiting requires proper test setup with RateLimiter::for');
