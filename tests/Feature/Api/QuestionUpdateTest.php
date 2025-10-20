<?php

use App\Enums\QuestionStatus;
use App\Enums\UnderReviewReason;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
});

it('updates a question successfully via API', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    $question = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => null,
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $newDepartment = Department::factory()->create();
    $newCourse = Course::factory()->create(['department_id' => $newDepartment->id]);
    $newSemester = Semester::factory()->create();
    $newExamType = ExamType::factory()->create(['requires_section' => false]);

    $data = [
        'department_id' => $newDepartment->id,
        'course_id' => $newCourse->id,
        'semester_id' => $newSemester->id,
        'exam_type_id' => $newExamType->id,
        'section' => null,
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->putJson("/api/questions/{$question->id}", $data);

    $response->assertOk();
    $response->assertJsonStructure([
        'data' => [
            'id',
            'created_at',
            'view_count',
            'pdf_size',
            'pdf_url',
            'section',
            'status',
            'department',
            'course',
            'semester',
            'exam_type',
            'user',
        ],
        'message',
    ]);

    $question->refresh();
    expect($question->department_id)->toBe($newDepartment->id);
    expect($question->course_id)->toBe($newCourse->id);
    expect($question->semester_id)->toBe($newSemester->id);
    expect($question->exam_type_id)->toBe($newExamType->id);
});

it('requires authentication to update', function () {
    $question = Question::factory()->create();

    $data = [
        'department_id' => $question->department_id,
        'course_id' => $question->course_id,
        'semester_id' => $question->semester_id,
        'exam_type_id' => $question->exam_type_id,
    ];

    $response = $this->putJson("/api/questions/{$question->id}", $data);

    $response->assertUnauthorized();
});

it('requires ownership to update', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();

    $question = Question::factory()->create([
        'user_id' => $owner->id,
    ]);

    $data = [
        'department_id' => $question->department_id,
        'course_id' => $question->course_id,
        'semester_id' => $question->semester_id,
        'exam_type_id' => $question->exam_type_id,
    ];

    $response = $this->actingAs($otherUser, 'sanctum')
        ->putJson("/api/questions/{$question->id}", $data);

    $response->assertForbidden();
});

it('validates required fields on update', function () {
    $user = User::factory()->create();
    $question = Question::factory()->create([
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->putJson("/api/questions/{$question->id}", []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['department_id', 'course_id', 'semester_id', 'exam_type_id']);
});

it('validates that course belongs to department on update', function () {
    $user = User::factory()->create();
    $department1 = Department::factory()->create();
    $department2 = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department2->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    $question = Question::factory()->create([
        'user_id' => $user->id,
    ]);

    $data = [
        'department_id' => $department1->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->putJson("/api/questions/{$question->id}", $data);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['course_id']);
});

it('updates question with new PDF', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    $question = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ]);

    // Add initial PDF
    $question->addMedia(base_path('public/pdf/fallback-pdf.pdf'))
        ->preservingOriginal()
        ->toMediaCollection('pdf');

    expect($question->hasMedia('pdf'))->toBeTrue();

    $data = [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'pdf' => UploadedFile::fake()->createWithContent('new-question.pdf', file_get_contents(base_path('public/pdf/fallback-pdf.pdf'))),
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->putJson("/api/questions/{$question->id}", $data);

    $response->assertOk();

    $question->refresh();
    expect($question->hasMedia('pdf'))->toBeTrue();
    expect($question->getMedia('pdf')->count())->toBe(1); // Should replace, not add
});

it('renames PDF when parameters change without new upload', function () {
    $user = User::factory()->create();
    $department1 = Department::factory()->create(['short_name' => 'DEPT1']);
    $department2 = Department::factory()->create(['short_name' => 'DEPT2']);
    $course1 = Course::factory()->create(['department_id' => $department1->id, 'name' => 'Course 1']);
    $course2 = Course::factory()->create(['department_id' => $department2->id, 'name' => 'Course 2']);
    $semester = Semester::factory()->create(['name' => 'Fall 2024']);
    $examType = ExamType::factory()->create(['name' => 'Midterm', 'requires_section' => false]);

    $question = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department1->id,
        'course_id' => $course1->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ]);

    // Add PDF
    $question->addMedia(base_path('public/pdf/fallback-pdf.pdf'))
        ->preservingOriginal()
        ->toMediaCollection('pdf');

    $oldFileName = $question->getFirstMedia('pdf')->file_name;

    // Update to different department and course
    $data = [
        'department_id' => $department2->id,
        'course_id' => $course2->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->putJson("/api/questions/{$question->id}", $data);

    $response->assertOk();

    $question->refresh();
    $newFileName = $question->getFirstMedia('pdf')->file_name;

    expect($newFileName)->not->toBe($oldFileName);
    expect($newFileName)->toContain('Course 2');
    expect($newFileName)->toContain('DEPT2');
});

it('detects duplicate on update', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    // Create existing question
    Question::factory()->create([
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => null,
    ]);

    // Create question to update
    $question = Question::factory()->create([
        'user_id' => $user->id,
    ]);

    $data = [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => null,
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->putJson("/api/questions/{$question->id}", $data);

    $response->assertUnprocessable();
    $response->assertJson([
        'message' => 'A question with these exact details already exists.',
        'errors' => [
            'duplicate' => ['A question with these exact details already exists. Please review and confirm if you want to proceed.'],
        ],
    ]);
});

it('updates with duplicate reason when confirmed', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    // Create existing question
    Question::factory()->create([
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => null,
    ]);

    // Create question to update
    $question = Question::factory()->create([
        'user_id' => $user->id,
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $data = [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => null,
        'confirmed_duplicate' => true,
        'duplicate_reason' => 'This is a different version',
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->putJson("/api/questions/{$question->id}", $data);

    $response->assertOk();
    $response->assertJson([
        'message' => 'Question submitted for review. Our team will verify if it\'s a duplicate and get back to you.',
    ]);

    $question->refresh();
    expect($question->status)->toBe(QuestionStatus::PENDING_REVIEW);
    expect($question->under_review_reason)->toBe(UnderReviewReason::DUPLICATE);
    expect($question->duplicate_reason)->toBe('This is a different version');
});

it('updates section when exam type requires it', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => true]);

    $question = Question::factory()->create([
        'user_id' => $user->id,
        'section' => 'A',
    ]);

    $data = [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => 'B',
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->putJson("/api/questions/{$question->id}", $data);

    $response->assertOk();

    $question->refresh();
    expect($question->section)->toBe('B');
});

it('validates PDF file type on update', function () {
    $user = User::factory()->create();
    $question = Question::factory()->create([
        'user_id' => $user->id,
    ]);

    $data = [
        'department_id' => $question->department_id,
        'course_id' => $question->course_id,
        'semester_id' => $question->semester_id,
        'exam_type_id' => $question->exam_type_id,
        'pdf' => UploadedFile::fake()->create('question.jpg', 1024),
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->putJson("/api/questions/{$question->id}", $data);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['pdf']);
});
