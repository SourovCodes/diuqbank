<?php

use App\Enums\QuestionStatus;
use App\Models\Question;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

it('includes status field in question detail resource', function () {
    $user = User::factory()->create();
    $question = Question::factory()->for($user)->published()->create();

    actingAs($user);

    $response = get(route('questions.show', $question));

    $response->assertInertia(fn ($page) => $page
        ->component('questions/show')
        ->has('question.status')
        ->where('question.status', QuestionStatus::PUBLISHED->value)
    );
});

it('allows owner to delete their non-published question', function () {
    $user = User::factory()->create();
    $question = Question::factory()->for($user)->needFix()->create();

    actingAs($user);

    $response = $this->delete(route('questions.destroy', $question));

    $response->assertRedirect(route('questions.index'));
    $response->assertSessionHas('success', 'Question deleted successfully!');
    $this->assertModelMissing($question);
});

it('prevents non-owner from deleting question', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $question = Question::factory()->for($owner)->needFix()->create();

    actingAs($otherUser);

    $response = $this->delete(route('questions.destroy', $question));

    $response->assertForbidden();
    $this->assertModelExists($question);
});

it('shows question to owner when status is need_fix', function () {
    $user = User::factory()->create();
    $question = Question::factory()->for($user)->needFix()->create();

    actingAs($user);

    $response = get(route('questions.show', $question));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('questions/show')
        ->where('question.status', QuestionStatus::NEED_FIX->value)
    );
});

it('prevents non-owner from viewing need_fix question', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $question = Question::factory()->for($owner)->needFix()->create();

    actingAs($otherUser);

    $response = get(route('questions.show', $question));

    $response->assertForbidden();
});

it('shows question to owner when status is pending_review', function () {
    $user = User::factory()->create();
    $question = Question::factory()->for($user)->underReview()->create();

    actingAs($user);

    $response = get(route('questions.show', $question));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('questions/show')
        ->where('question.status', QuestionStatus::PENDING_REVIEW->value)
    );
});

it('prevents non-owner from viewing pending_review question', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $question = Question::factory()->for($owner)->underReview()->create();

    actingAs($otherUser);

    $response = get(route('questions.show', $question));

    $response->assertForbidden();
});

it('allows anyone to view published questions', function () {
    $owner = User::factory()->create();
    $question = Question::factory()->for($owner)->published()->create();

    $response = get(route('questions.show', $question));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('questions/show')
        ->where('question.status', QuestionStatus::PUBLISHED->value)
    );
});

it('caches question data for 24 hours', function () {
    $user = User::factory()->create();
    $question = Question::factory()->for($user)->published()->create();

    // First request should cache the question
    get(route('questions.show', $question));

    // Verify cache exists
    expect(cache()->has("question_{$question->id}"))->toBeTrue();

    // Verify cached data contains the question with relationships
    $cachedQuestion = cache()->get("question_{$question->id}");
    expect($cachedQuestion)->toBeInstanceOf(Question::class);
    expect($cachedQuestion->id)->toBe($question->id);
    expect($cachedQuestion->relationLoaded('department'))->toBeTrue();
    expect($cachedQuestion->relationLoaded('course'))->toBeTrue();
    expect($cachedQuestion->relationLoaded('semester'))->toBeTrue();
    expect($cachedQuestion->relationLoaded('examType'))->toBeTrue();
    expect($cachedQuestion->relationLoaded('user'))->toBeTrue();
});

it('clears cache when question is updated', function () {
    $user = User::factory()->create();
    $question = Question::factory()->for($user)->published()->create();

    // Cache the question by viewing it
    actingAs($user);
    get(route('questions.show', $question));

    expect(cache()->has("question_{$question->id}"))->toBeTrue();

    // Update the question
    $this->put(route('questions.update', $question), [
        'department_id' => $question->department_id,
        'course_id' => $question->course_id,
        'semester_id' => $question->semester_id,
        'exam_type_id' => $question->exam_type_id,
        'section' => 'B',
    ]);

    // Cache should be cleared
    expect(cache()->has("question_{$question->id}"))->toBeFalse();
});

it('clears cache when question is deleted', function () {
    $user = User::factory()->create();
    $question = Question::factory()->for($user)->published()->create();

    // Cache the question by viewing it
    actingAs($user);
    get(route('questions.show', $question));

    expect(cache()->has("question_{$question->id}"))->toBeTrue();

    // Delete the question
    $this->delete(route('questions.destroy', $question));

    // Cache should be cleared
    expect(cache()->has("question_{$question->id}"))->toBeFalse();
});

it('uses cached data on subsequent requests', function () {
    $user = User::factory()->create();
    $question = Question::factory()->for($user)->published()->create();

    // First request
    get(route('questions.show', $question));

    // Manually modify cached data to verify it's being used
    $cachedQuestion = cache()->get("question_{$question->id}");
    $cachedQuestion->view_count = 999;
    cache()->put("question_{$question->id}", $cachedQuestion, now()->addHours(24));

    // Second request should use cached data
    $response = get(route('questions.show', $question));

    $response->assertInertia(fn ($page) => $page
        ->component('questions/show')
        ->where('question.view_count', 999)
    );
});
