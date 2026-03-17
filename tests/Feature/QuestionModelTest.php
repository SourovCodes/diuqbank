<?php

use App\Enums\QuestionStatus;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\Submission;

test('question has title attribute', function () {
    $department = Department::factory()->create(['short_name' => 'CSE']);
    $course = Course::factory()->create(['name' => 'Data Structures', 'department_id' => $department->id]);
    $semester = Semester::factory()->create(['name' => 'Fall 2025']);
    $examType = ExamType::factory()->create(['name' => 'Midterm']);

    $question = Question::factory()->create([
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ]);

    expect($question->title)->toBe('Data Structures (CSE), Fall 2025, Midterm');
});

test('question title handles missing relationships gracefully', function () {
    $question = new Question;

    expect($question->title)->toBe('Unknown Course (N/A), Unknown Semester, Unknown Exam');
});

test('matchesSearch returns true when all words match', function () {
    $department = Department::factory()->create(['short_name' => 'CSE']);
    $course = Course::factory()->create(['name' => 'Data Structures', 'department_id' => $department->id]);
    $semester = Semester::factory()->create(['name' => 'Fall 2025']);
    $examType = ExamType::factory()->create(['name' => 'Midterm']);

    $question = Question::factory()->create([
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ]);

    expect($question->matchesSearch('Data Structures'))->toBeTrue();
    expect($question->matchesSearch('CSE'))->toBeTrue();
    expect($question->matchesSearch('Fall 2025'))->toBeTrue();
    expect($question->matchesSearch('Midterm'))->toBeTrue();
    expect($question->matchesSearch('data cse'))->toBeTrue();
});

test('matchesSearch is case insensitive', function () {
    $department = Department::factory()->create(['short_name' => 'CSE']);
    $course = Course::factory()->create(['name' => 'Data Structures', 'department_id' => $department->id]);

    $question = Question::factory()->create([
        'department_id' => $department->id,
        'course_id' => $course->id,
    ]);

    expect($question->matchesSearch('DATA STRUCTURES'))->toBeTrue();
    expect($question->matchesSearch('cse'))->toBeTrue();
});

test('matchesSearch returns false when word does not match', function () {
    $department = Department::factory()->create(['short_name' => 'CSE']);
    $course = Course::factory()->create(['name' => 'Data Structures', 'department_id' => $department->id]);

    $question = Question::factory()->create([
        'department_id' => $department->id,
        'course_id' => $course->id,
    ]);

    expect($question->matchesSearch('Algorithms'))->toBeFalse();
    expect($question->matchesSearch('EEE'))->toBeFalse();
    expect($question->matchesSearch('Data Algorithms'))->toBeFalse();
});

test('matchesSearch handles empty search', function () {
    $question = Question::factory()->create();

    expect($question->matchesSearch(''))->toBeTrue();
    expect($question->matchesSearch('   '))->toBeTrue();
});

test('published scope filters only published questions', function () {
    $publishedQuestion = Question::factory()->published()->create();
    $pendingQuestion = Question::factory()->pendingReview()->create();
    $rejectedQuestion = Question::factory()->rejected()->create();

    $published = Question::published()->get();

    expect($published)->toHaveCount(1);
    expect($published->first()->id)->toBe($publishedQuestion->id);
});

test('department scope filters by department', function () {
    $department1 = Department::factory()->create();
    $department2 = Department::factory()->create();

    $course1 = Course::factory()->create(['department_id' => $department1->id]);
    $course2 = Course::factory()->create(['department_id' => $department2->id]);

    $question1 = Question::factory()->create(['department_id' => $department1->id, 'course_id' => $course1->id]);
    $question2 = Question::factory()->create(['department_id' => $department2->id, 'course_id' => $course2->id]);

    $filtered = Question::query()->department($department1->id)->get();

    expect($filtered)->toHaveCount(1);
    expect($filtered->first()->id)->toBe($question1->id);
});

test('department scope returns all when null', function () {
    Question::factory()->count(3)->create();

    $filtered = Question::query()->department(null)->get();

    expect($filtered)->toHaveCount(3);
});

test('course scope filters by course', function () {
    $course1 = Course::factory()->create();
    $course2 = Course::factory()->create();

    $question1 = Question::factory()->create(['course_id' => $course1->id]);
    $question2 = Question::factory()->create(['course_id' => $course2->id]);

    $filtered = Question::query()->course($course1->id)->get();

    expect($filtered)->toHaveCount(1);
    expect($filtered->first()->id)->toBe($question1->id);
});

test('semester scope filters by semester', function () {
    $semester1 = Semester::factory()->create();
    $semester2 = Semester::factory()->create();

    $question1 = Question::factory()->create(['semester_id' => $semester1->id]);
    $question2 = Question::factory()->create(['semester_id' => $semester2->id]);

    $filtered = Question::query()->semester($semester1->id)->get();

    expect($filtered)->toHaveCount(1);
    expect($filtered->first()->id)->toBe($question1->id);
});

test('examType scope filters by exam type', function () {
    $examType1 = ExamType::factory()->create();
    $examType2 = ExamType::factory()->create();

    $question1 = Question::factory()->create(['exam_type_id' => $examType1->id]);
    $question2 = Question::factory()->create(['exam_type_id' => $examType2->id]);

    $filtered = Question::query()->examType($examType1->id)->get();

    expect($filtered)->toHaveCount(1);
    expect($filtered->first()->id)->toBe($question1->id);
});

test('question status is cast to enum', function () {
    $question = Question::factory()->published()->create();

    expect($question->status)->toBeInstanceOf(QuestionStatus::class);
    expect($question->status)->toBe(QuestionStatus::Published);
});

test('question has department relationship', function () {
    $department = Department::factory()->create();
    $question = Question::factory()->create(['department_id' => $department->id]);

    expect($question->department)->toBeInstanceOf(Department::class);
    expect($question->department->id)->toBe($department->id);
});

test('question has course relationship', function () {
    $course = Course::factory()->create();
    $question = Question::factory()->create(['course_id' => $course->id]);

    expect($question->course)->toBeInstanceOf(Course::class);
    expect($question->course->id)->toBe($course->id);
});

test('question has semester relationship', function () {
    $semester = Semester::factory()->create();
    $question = Question::factory()->create(['semester_id' => $semester->id]);

    expect($question->semester)->toBeInstanceOf(Semester::class);
    expect($question->semester->id)->toBe($semester->id);
});

test('question has examType relationship', function () {
    $examType = ExamType::factory()->create();
    $question = Question::factory()->create(['exam_type_id' => $examType->id]);

    expect($question->examType)->toBeInstanceOf(ExamType::class);
    expect($question->examType->id)->toBe($examType->id);
});

test('question has submissions relationship', function () {
    $question = Question::factory()->create();
    $submissions = Submission::factory()->count(3)->create(['question_id' => $question->id]);

    expect($question->submissions)->toHaveCount(3);
    expect($question->submissions->first())->toBeInstanceOf(Submission::class);
});
