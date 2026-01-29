<?php

use App\Models\Question;
use App\Models\Submission;
use App\Models\User;
use App\Models\Vote;
use Inertia\Testing\AssertableInertia as Assert;

test('published question page can be rendered', function () {
    $question = Question::factory()->published()->create();

    $response = $this->get("/questions/{$question->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('questions/show')
        ->has('question')
        ->has('submissions')
        ->where('question.id', $question->id)
    );
});

test('pending review question returns 404', function () {
    $question = Question::factory()->pendingReview()->create();

    $response = $this->get("/questions/{$question->id}");

    $response->assertStatus(404);
});

test('rejected question returns 404', function () {
    $question = Question::factory()->rejected()->create();

    $response = $this->get("/questions/{$question->id}");

    $response->assertStatus(404);
});

test('question page displays related information', function () {
    $question = Question::factory()->published()->create();

    $response = $this->get("/questions/{$question->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('questions/show')
        ->has('question.department')
        ->has('question.course')
        ->has('question.semester')
        ->has('question.exam_type')
    );
});

test('question page displays submissions', function () {
    $question = Question::factory()->published()->create();
    $submission1 = Submission::factory()->create(['question_id' => $question->id]);
    $submission2 = Submission::factory()->create(['question_id' => $question->id]);

    $response = $this->get("/questions/{$question->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('questions/show')
        ->has('submissions', 2)
    );
});

test('submissions are sorted by vote score descending', function () {
    $question = Question::factory()->published()->create();
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $user3 = User::factory()->create();

    $lowVoteSubmission = Submission::factory()->create(['question_id' => $question->id]);
    $highVoteSubmission = Submission::factory()->create(['question_id' => $question->id]);

    // Add votes - highVoteSubmission gets more votes
    Vote::factory()->create(['submission_id' => $highVoteSubmission->id, 'user_id' => $user1->id, 'value' => 1]);
    Vote::factory()->create(['submission_id' => $highVoteSubmission->id, 'user_id' => $user2->id, 'value' => 1]);
    Vote::factory()->create(['submission_id' => $lowVoteSubmission->id, 'user_id' => $user3->id, 'value' => 1]);

    $response = $this->get("/questions/{$question->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('questions/show')
        ->has('submissions', 2)
        ->where('submissions.0.id', $highVoteSubmission->id)
        ->where('submissions.1.id', $lowVoteSubmission->id)
    );
});

test('non-existent question returns 404', function () {
    $response = $this->get('/questions/99999');

    $response->assertStatus(404);
});
