<?php

use App\Enums\QuestionStatus;
use App\Models\Question;
use App\Models\User;

it('displays the dashboard page for authenticated users', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/index')
        ->has('stats')
        ->has('questions')
    );
});

it('redirects unauthenticated users to login', function () {
    $response = $this->get('/dashboard');

    $response->assertRedirect('/login');
});

it('shows correct statistics for the user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    // Create questions for the authenticated user
    Question::factory()->create(['user_id' => $user->id, 'status' => QuestionStatus::PUBLISHED, 'view_count' => 10]);
    Question::factory()->create(['user_id' => $user->id, 'status' => QuestionStatus::PUBLISHED, 'view_count' => 20]);
    Question::factory()->create(['user_id' => $user->id, 'status' => QuestionStatus::PENDING_REVIEW, 'view_count' => 5]);
    Question::factory()->create(['user_id' => $user->id, 'status' => QuestionStatus::NEED_FIX, 'view_count' => 3]);

    // Create questions for other user (should not be counted)
    Question::factory()->create(['user_id' => $otherUser->id, 'status' => QuestionStatus::PUBLISHED, 'view_count' => 100]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/index')
        ->where('stats.total_questions', 4)
        ->where('stats.published', 2)
        ->where('stats.pending_review', 1)
        ->where('stats.need_fix', 1)
        ->where('stats.total_views', 38)
    );
});

it('displays the user\'s questions with pagination', function () {
    $user = User::factory()->create();

    // Create 15 questions for the user
    Question::factory()->count(15)->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/index')
        ->has('questions.data', 10) // First page should have 10 items
        ->where('questions.total', 15)
        ->where('questions.per_page', 10)
        ->where('questions.current_page', 1)
        ->where('questions.last_page', 2)
    );
});

it('shows only the authenticated user\'s questions', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    // Create questions for the authenticated user
    $userQuestion = Question::factory()->create(['user_id' => $user->id]);

    // Create questions for another user
    $otherQuestion = Question::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/index')
        ->where('questions.total', 1)
        ->where('questions.data.0.id', $userQuestion->id)
    );
});

it('displays zero stats when user has no questions', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/index')
        ->where('stats.total_questions', 0)
        ->where('stats.published', 0)
        ->where('stats.pending_review', 0)
        ->where('stats.need_fix', 0)
        ->where('stats.total_views', 0)
        ->where('questions.total', 0)
    );
});
