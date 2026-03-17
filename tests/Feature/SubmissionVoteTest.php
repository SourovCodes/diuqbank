<?php

use App\Models\Submission;
use App\Models\User;
use App\Models\Vote;

test('guest cannot upvote submission', function () {
    $submission = Submission::factory()->create();

    $response = $this->post("/submissions/{$submission->id}/upvote");

    $response->assertRedirect('/login');
});

test('guest cannot downvote submission', function () {
    $submission = Submission::factory()->create();

    $response = $this->post("/submissions/{$submission->id}/downvote");

    $response->assertRedirect('/login');
});

test('authenticated user can upvote submission', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    $response = $this->actingAs($user)->post("/submissions/{$submission->id}/upvote");

    $response->assertRedirect();
    $this->assertDatabaseHas('votes', [
        'submission_id' => $submission->id,
        'user_id' => $user->id,
        'value' => 1,
    ]);
});

test('authenticated user can downvote submission', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    $response = $this->actingAs($user)->post("/submissions/{$submission->id}/downvote");

    $response->assertRedirect();
    $this->assertDatabaseHas('votes', [
        'submission_id' => $submission->id,
        'user_id' => $user->id,
        'value' => -1,
    ]);
});

test('upvoting again removes the upvote', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    // First upvote
    $this->actingAs($user)->post("/submissions/{$submission->id}/upvote");
    expect(Vote::where('user_id', $user->id)->where('submission_id', $submission->id)->exists())->toBeTrue();

    // Second upvote removes it
    $this->actingAs($user)->post("/submissions/{$submission->id}/upvote");
    expect(Vote::where('user_id', $user->id)->where('submission_id', $submission->id)->exists())->toBeFalse();
});

test('downvoting again removes the downvote', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    // First downvote
    $this->actingAs($user)->post("/submissions/{$submission->id}/downvote");
    expect(Vote::where('user_id', $user->id)->where('submission_id', $submission->id)->exists())->toBeTrue();

    // Second downvote removes it
    $this->actingAs($user)->post("/submissions/{$submission->id}/downvote");
    expect(Vote::where('user_id', $user->id)->where('submission_id', $submission->id)->exists())->toBeFalse();
});

test('upvoting after downvote changes vote to upvote', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    // First downvote
    $this->actingAs($user)->post("/submissions/{$submission->id}/downvote");
    $this->assertDatabaseHas('votes', [
        'submission_id' => $submission->id,
        'user_id' => $user->id,
        'value' => -1,
    ]);

    // Then upvote
    $this->actingAs($user)->post("/submissions/{$submission->id}/upvote");
    $this->assertDatabaseHas('votes', [
        'submission_id' => $submission->id,
        'user_id' => $user->id,
        'value' => 1,
    ]);
    $this->assertDatabaseCount('votes', 1);
});

test('downvoting after upvote changes vote to downvote', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    // First upvote
    $this->actingAs($user)->post("/submissions/{$submission->id}/upvote");
    $this->assertDatabaseHas('votes', [
        'submission_id' => $submission->id,
        'user_id' => $user->id,
        'value' => 1,
    ]);

    // Then downvote
    $this->actingAs($user)->post("/submissions/{$submission->id}/downvote");
    $this->assertDatabaseHas('votes', [
        'submission_id' => $submission->id,
        'user_id' => $user->id,
        'value' => -1,
    ]);
    $this->assertDatabaseCount('votes', 1);
});
