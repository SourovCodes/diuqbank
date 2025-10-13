<?php

use App\Enums\QuestionStatus;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;

use function Pest\Laravel\get;

test('questions index only shows published questions', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

    // Create questions with different statuses
    $publishedQuestion = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $pendingQuestion = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'status' => QuestionStatus::PENDING_REVIEW,
    ]);

    $needFixQuestion = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'status' => QuestionStatus::NEED_FIX,
    ]);

    $response = get(route('questions.index'));

    $response->assertSuccessful();

    // Check that only published question is in the response
    $questions = $response->viewData('page')['props']['questions']['data'];
    $questionIds = collect($questions)->pluck('id')->toArray();

    expect($questionIds)->toContain($publishedQuestion->id)
        ->and($questionIds)->not->toContain($pendingQuestion->id)
        ->and($questionIds)->not->toContain($needFixQuestion->id);
});

test('contributor show page only shows published questions', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

    // Create questions with different statuses
    $publishedQuestion = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $pendingQuestion = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'status' => QuestionStatus::PENDING_REVIEW,
    ]);

    $needFixQuestion = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'status' => QuestionStatus::NEED_FIX,
    ]);

    $response = get(route('contributors.show', $user));

    $response->assertSuccessful();

    // Check that only published question is in the response
    $questions = $response->viewData('page')['props']['questions']['data'];
    $questionIds = collect($questions)->pluck('id')->toArray();

    expect($questionIds)->toContain($publishedQuestion->id)
        ->and($questionIds)->not->toContain($pendingQuestion->id)
        ->and($questionIds)->not->toContain($needFixQuestion->id);
});

test('published scope filters questions correctly', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

    // Create questions with different statuses
    $publishedQuestions = Question::factory()->count(3)->create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'status' => QuestionStatus::PUBLISHED,
    ]);

    Question::factory()->count(2)->create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'status' => QuestionStatus::PENDING_REVIEW,
    ]);

    Question::factory()->count(1)->create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'status' => QuestionStatus::NEED_FIX,
    ]);

    $result = Question::query()->published()->get();

    expect($result)->toHaveCount(3)
        ->and($result->pluck('id')->toArray())->toEqual($publishedQuestions->pluck('id')->toArray());
});
