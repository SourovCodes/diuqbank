<?php

use App\Enums\QuestionStatus;
use App\Enums\UnderReviewReason;
use App\Models\Question;

test('questions default to published status', function () {
    $question = Question::factory()->create();

    expect($question->status)->toBe(QuestionStatus::PUBLISHED);
    expect($question->under_review_reason)->toBeNull();
    expect($question->duplicate_reason)->toBeNull();
});

test('questions can be set to pending review with reason', function () {
    $question = Question::factory()->create([
        'status' => QuestionStatus::PENDING_REVIEW,
        'under_review_reason' => UnderReviewReason::NEW_USER,
    ]);

    expect($question->status)->toBe(QuestionStatus::PENDING_REVIEW);
    expect($question->under_review_reason)->toBe(UnderReviewReason::NEW_USER);
    expect($question->duplicate_reason)->toBeNull();
});

test('questions can be marked as duplicate with reason', function () {
    $duplicateReason = 'This question is a duplicate of question #123';

    $question = Question::factory()->create([
        'status' => QuestionStatus::PENDING_REVIEW,
        'under_review_reason' => UnderReviewReason::DUPLICATE,
        'duplicate_reason' => $duplicateReason,
    ]);

    expect($question->status)->toBe(QuestionStatus::PENDING_REVIEW);
    expect($question->under_review_reason)->toBe(UnderReviewReason::DUPLICATE);
    expect($question->duplicate_reason)->toBe($duplicateReason);
});

test('questions can be marked as need fix', function () {
    $question = Question::factory()->create([
        'status' => QuestionStatus::NEED_FIX,
    ]);

    expect($question->status)->toBe(QuestionStatus::NEED_FIX);
    expect($question->under_review_reason)->toBeNull();
    expect($question->duplicate_reason)->toBeNull();
});

test('factory can create under review questions', function () {
    $question = Question::factory()->underReview()->create();

    expect($question->status)->toBe(QuestionStatus::PENDING_REVIEW);
    expect($question->under_review_reason)->toBeInstanceOf(UnderReviewReason::class);
});

test('factory can create duplicate questions with reason', function () {
    $question = Question::factory()->duplicate('Duplicate of question #456')->create();

    expect($question->status)->toBe(QuestionStatus::PENDING_REVIEW);
    expect($question->under_review_reason)->toBe(UnderReviewReason::DUPLICATE);
    expect($question->duplicate_reason)->toBe('Duplicate of question #456');
});

test('factory can create under review questions with specific reason', function () {
    $question = Question::factory()->underReview(UnderReviewReason::MULTIPLE_USER_REPORTS)->create();

    expect($question->status)->toBe(QuestionStatus::PENDING_REVIEW);
    expect($question->under_review_reason)->toBe(UnderReviewReason::MULTIPLE_USER_REPORTS);
    expect($question->duplicate_reason)->toBeNull();
});

test('factory can create need fix questions', function () {
    $question = Question::factory()->needFix()->create();

    expect($question->status)->toBe(QuestionStatus::NEED_FIX);
    expect($question->under_review_reason)->toBeNull();
    expect($question->duplicate_reason)->toBeNull();
});

test('all under review reasons are valid', function () {
    $reasons = [
        UnderReviewReason::DUPLICATE,
        UnderReviewReason::NEW_USER,
        UnderReviewReason::NEW_FILTER_OPTION,
        UnderReviewReason::MULTIPLE_USER_REPORTS,
    ];

    foreach ($reasons as $reason) {
        $question = Question::factory()->create([
            'status' => QuestionStatus::PENDING_REVIEW,
            'under_review_reason' => $reason,
        ]);

        expect($question->under_review_reason)->toBe($reason);
    }
});

test('enum labels work correctly', function () {
    expect(QuestionStatus::PUBLISHED->getLabel())->toBe('Published');
    expect(QuestionStatus::PENDING_REVIEW->getLabel())->toBe('Pending Review');
    expect(QuestionStatus::NEED_FIX->getLabel())->toBe('Need Fix');

    expect(UnderReviewReason::DUPLICATE->getLabel())->toBe('Duplicate');
    expect(UnderReviewReason::NEW_USER->getLabel())->toBe('New User');
    expect(UnderReviewReason::NEW_FILTER_OPTION->getLabel())->toBe('New Filter Option');
    expect(UnderReviewReason::MULTIPLE_USER_REPORTS->getLabel())->toBe('Multiple User Reports');
});

test('enum colors work correctly', function () {
    expect(QuestionStatus::PUBLISHED->getColor())->toBe('success');
    expect(QuestionStatus::PENDING_REVIEW->getColor())->toBe('warning');
    expect(QuestionStatus::NEED_FIX->getColor())->toBe('danger');

    expect(UnderReviewReason::DUPLICATE->getColor())->toBe('danger');
    expect(UnderReviewReason::NEW_USER->getColor())->toBe('info');
    expect(UnderReviewReason::NEW_FILTER_OPTION->getColor())->toBe('warning');
    expect(UnderReviewReason::MULTIPLE_USER_REPORTS->getColor())->toBe('danger');
});

test('enum icons work correctly', function () {
    expect(QuestionStatus::PUBLISHED->getIcon())->toBe('heroicon-m-check-circle');
    expect(QuestionStatus::PENDING_REVIEW->getIcon())->toBe('heroicon-m-clock');
    expect(QuestionStatus::NEED_FIX->getIcon())->toBe('heroicon-m-x-circle');

    expect(UnderReviewReason::DUPLICATE->getIcon())->toBe('heroicon-m-document-duplicate');
    expect(UnderReviewReason::NEW_USER->getIcon())->toBe('heroicon-m-user-plus');
    expect(UnderReviewReason::NEW_FILTER_OPTION->getIcon())->toBe('heroicon-m-funnel');
    expect(UnderReviewReason::MULTIPLE_USER_REPORTS->getIcon())->toBe('heroicon-m-flag');
});
