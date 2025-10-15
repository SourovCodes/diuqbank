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
