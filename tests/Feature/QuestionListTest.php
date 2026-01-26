<?php

use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use Inertia\Testing\AssertableInertia as Assert;

test('questions index page can be rendered', function () {
    $response = $this->get('/questions');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('questions/index')
        ->has('questions')
        ->has('departments')
        ->has('courses')
        ->has('semesters')
        ->has('examTypes')
        ->has('filters')
    );
});

test('questions index displays only published questions', function () {
    $publishedQuestion = Question::factory()->published()->create();
    $pendingQuestion = Question::factory()->pendingReview()->create();
    $rejectedQuestion = Question::factory()->rejected()->create();

    $response = $this->get('/questions');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('questions/index')
        ->has('questions.data', 1)
        ->where('questions.data.0.id', $publishedQuestion->id)
    );
});

test('questions can be filtered by department', function () {
    $department1 = Department::factory()->create();
    $department2 = Department::factory()->create();

    $course1 = Course::factory()->create(['department_id' => $department1->id]);
    $course2 = Course::factory()->create(['department_id' => $department2->id]);

    $question1 = Question::factory()->published()->create([
        'department_id' => $department1->id,
        'course_id' => $course1->id,
    ]);
    $question2 = Question::factory()->published()->create([
        'department_id' => $department2->id,
        'course_id' => $course2->id,
    ]);

    $response = $this->get('/questions?department=' . $department1->id);

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('questions/index')
        ->has('questions.data', 1)
        ->where('questions.data.0.id', $question1->id)
    );
});

test('questions can be filtered by course', function () {
    $department = Department::factory()->create();
    $course1 = Course::factory()->create(['department_id' => $department->id]);
    $course2 = Course::factory()->create(['department_id' => $department->id]);

    $question1 = Question::factory()->published()->create([
        'department_id' => $department->id,
        'course_id' => $course1->id,
    ]);
    $question2 = Question::factory()->published()->create([
        'department_id' => $department->id,
        'course_id' => $course2->id,
    ]);

    $response = $this->get('/questions?course=' . $course1->id);

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('questions/index')
        ->has('questions.data', 1)
        ->where('questions.data.0.id', $question1->id)
    );
});

test('questions can be filtered by semester', function () {
    $semester1 = Semester::factory()->create();
    $semester2 = Semester::factory()->create();

    $question1 = Question::factory()->published()->create(['semester_id' => $semester1->id]);
    $question2 = Question::factory()->published()->create(['semester_id' => $semester2->id]);

    $response = $this->get('/questions?semester=' . $semester1->id);

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('questions/index')
        ->has('questions.data', 1)
        ->where('questions.data.0.id', $question1->id)
    );
});

test('questions can be filtered by exam type', function () {
    $examType1 = ExamType::factory()->create();
    $examType2 = ExamType::factory()->create();

    $question1 = Question::factory()->published()->create(['exam_type_id' => $examType1->id]);
    $question2 = Question::factory()->published()->create(['exam_type_id' => $examType2->id]);

    $response = $this->get('/questions?exam_type=' . $examType1->id);

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('questions/index')
        ->has('questions.data', 1)
        ->where('questions.data.0.id', $question1->id)
    );
});

test('questions can be filtered by multiple criteria', function () {
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

    $matchingQuestion = Question::factory()->published()->create([
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ]);

    // Create questions that don't match all filters
    Question::factory()->published()->create(['department_id' => $department->id]);
    Question::factory()->published()->create();

    $response = $this->get("/questions?department={$department->id}&course={$course->id}&semester={$semester->id}&exam_type={$examType->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('questions/index')
        ->has('questions.data', 1)
        ->where('questions.data.0.id', $matchingQuestion->id)
    );
});
