<?php

use App\Models\Question;
use App\Models\Submission;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('contributors index page can be rendered', function () {
    $response = $this->get('/contributors');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('contributors/index')
        ->has('contributors')
        ->has('filters')
    );
});

test('contributors index shows only users with submissions', function () {
    $userWithSubmission = User::factory()->create();
    $userWithoutSubmission = User::factory()->create();

    Submission::factory()->create(['user_id' => $userWithSubmission->id]);

    $response = $this->get('/contributors');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('contributors/index')
        ->has('contributors.data', 1)
        ->where('contributors.data.0.id', $userWithSubmission->id)
    );
});

test('contributors can be searched by name', function () {
    $johnUser = User::factory()->create(['name' => 'John Doe']);
    $janeUser = User::factory()->create(['name' => 'Jane Smith']);

    Submission::factory()->create(['user_id' => $johnUser->id]);
    Submission::factory()->create(['user_id' => $janeUser->id]);

    $response = $this->get('/contributors?search=John');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('contributors/index')
        ->has('contributors.data', 1)
        ->where('contributors.data.0.name', 'John Doe')
    );
});

test('contributors can be searched by username', function () {
    $user1 = User::factory()->create(['username' => 'johndoe123']);
    $user2 = User::factory()->create(['username' => 'janesmith456']);

    Submission::factory()->create(['user_id' => $user1->id]);
    Submission::factory()->create(['user_id' => $user2->id]);

    $response = $this->get('/contributors?search=johndoe');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('contributors/index')
        ->has('contributors.data', 1)
        ->where('contributors.data.0.username', 'johndoe123')
    );
});

test('contributor show page displays user profile', function () {
    $user = User::factory()->create(['username' => 'testuser']);
    $question = Question::factory()->published()->create();
    Submission::factory()->create([
        'user_id' => $user->id,
        'question_id' => $question->id,
    ]);

    $response = $this->get("/contributors/{$user->username}");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('contributors/show')
        ->has('contributor')
        ->has('submissions')
        ->where('contributor.username', 'testuser')
    );
});

test('contributor show page only displays published question submissions', function () {
    $user = User::factory()->create(['username' => 'testuser2']);

    $publishedQuestion = Question::factory()->published()->create();
    $pendingQuestion = Question::factory()->pendingReview()->create();

    Submission::factory()->create([
        'user_id' => $user->id,
        'question_id' => $publishedQuestion->id,
    ]);
    Submission::factory()->create([
        'user_id' => $user->id,
        'question_id' => $pendingQuestion->id,
    ]);

    $response = $this->get("/contributors/{$user->username}");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('contributors/show')
        ->has('submissions.data', 1)
    );
});

test('contributor show page returns 404 for non-existent user', function () {
    $response = $this->get('/contributors/nonexistentuser');

    $response->assertStatus(404);
});
