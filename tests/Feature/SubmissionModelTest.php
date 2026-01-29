<?php

use App\Models\Submission;
use App\Models\User;
use App\Models\Vote;

test('upvote creates a vote with value 1', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    $vote = $submission->upvote($user);

    expect($vote)->toBeInstanceOf(Vote::class);
    expect($vote->value)->toBe(1);
    expect($vote->user_id)->toBe($user->id);
    expect($vote->submission_id)->toBe($submission->id);
});

test('downvote creates a vote with value -1', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    $vote = $submission->downvote($user);

    expect($vote)->toBeInstanceOf(Vote::class);
    expect($vote->value)->toBe(-1);
    expect($vote->user_id)->toBe($user->id);
});

test('upvote updates existing downvote to upvote', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    $submission->downvote($user);
    expect(Vote::where('submission_id', $submission->id)->where('user_id', $user->id)->first()->value)->toBe(-1);

    $submission->upvote($user);
    expect(Vote::where('submission_id', $submission->id)->where('user_id', $user->id)->first()->value)->toBe(1);
    expect(Vote::where('submission_id', $submission->id)->where('user_id', $user->id)->count())->toBe(1);
});

test('downvote updates existing upvote to downvote', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    $submission->upvote($user);
    $submission->downvote($user);

    expect(Vote::where('submission_id', $submission->id)->where('user_id', $user->id)->first()->value)->toBe(-1);
    expect(Vote::where('submission_id', $submission->id)->where('user_id', $user->id)->count())->toBe(1);
});

test('removeVote deletes the users vote', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    $submission->upvote($user);
    expect(Vote::where('submission_id', $submission->id)->where('user_id', $user->id)->exists())->toBeTrue();

    $result = $submission->removeVote($user);

    expect($result)->toBeTrue();
    expect(Vote::where('submission_id', $submission->id)->where('user_id', $user->id)->exists())->toBeFalse();
});

test('removeVote returns false when no vote exists', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    $result = $submission->removeVote($user);

    expect($result)->toBeFalse();
});

test('getUserVote returns vote value when user has voted', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    $submission->upvote($user);
    expect($submission->getUserVote($user))->toBe(1);

    $submission->downvote($user);
    expect($submission->getUserVote($user))->toBe(-1);
});

test('getUserVote returns null when user has not voted', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create();

    expect($submission->getUserVote($user))->toBeNull();
});

test('getVoteScoreAttribute calculates total vote score', function () {
    $submission = Submission::factory()->create();
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $user3 = User::factory()->create();

    $submission->upvote($user1);
    $submission->upvote($user2);
    $submission->downvote($user3);

    expect($submission->vote_score)->toBe(1);
});

test('incrementViews increases view count', function () {
    $submission = Submission::factory()->create(['views' => 0]);

    $submission->incrementViews();

    expect($submission->fresh()->views)->toBe(1);

    $submission->incrementViews();
    $submission->incrementViews();

    expect($submission->fresh()->views)->toBe(3);
});
