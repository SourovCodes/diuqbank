<?php

use App\Enums\QuestionStatus;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;

use function Pest\Laravel\get;

test('questions index loads without filters', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

    Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $response = get(route('questions.index'));

    $response->assertSuccessful();
});

test('questions index filters by department', function () {
    $user = User::factory()->create();
    $department1 = Department::factory()->create(['short_name' => 'CSE']);
    $department2 = Department::factory()->create(['short_name' => 'EEE']);
    $course1 = Course::factory()->create(['department_id' => $department1->id]);
    $course2 = Course::factory()->create(['department_id' => $department2->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

    $question1 = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department1->id,
        'course_id' => $course1->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $question2 = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department2->id,
        'course_id' => $course2->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $response = get(route('questions.index', ['department' => $department1->id]));

    $response->assertSuccessful();

    $questions = $response->viewData('page')['props']['questions']['data'];
    $questionIds = collect($questions)->pluck('id')->toArray();

    expect($questionIds)->toContain($question1->id)
        ->and($questionIds)->not->toContain($question2->id);
});

test('questions index redirects when department filter is invalid', function () {
    $response = get(route('questions.index', ['department' => 99999]));

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('department=99999');
});

test('questions index redirects when course does not belong to department', function () {
    $department1 = Department::factory()->create();
    $department2 = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department2->id]);

    $response = get(route('questions.index', [
        'department' => $department1->id,
        'course' => $course->id,
    ]));

    $response->assertRedirect();
});

test('questions index filters by valid course and department combination', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

    $question = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $response = get(route('questions.index', [
        'department' => $department->id,
        'course' => $course->id,
    ]));

    $response->assertSuccessful();

    $questions = $response->viewData('page')['props']['questions']['data'];
    $questionIds = collect($questions)->pluck('id')->toArray();

    expect($questionIds)->toContain($question->id);
});

test('questions index redirects when semester filter is invalid', function () {
    $response = get(route('questions.index', ['semester' => 99999]));

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('semester=99999');
});

test('questions index redirects when exam type filter is invalid', function () {
    $response = get(route('questions.index', ['examType' => 99999]));

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('examType=99999');
});

test('questions index filters by multiple valid filters', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

    $question = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $response = get(route('questions.index', [
        'department' => $department->id,
        'course' => $course->id,
        'semester' => $semester->id,
        'examType' => $examType->id,
    ]));

    $response->assertSuccessful();

    $questions = $response->viewData('page')['props']['questions']['data'];
    $questionIds = collect($questions)->pluck('id')->toArray();

    expect($questionIds)->toContain($question->id);
});
