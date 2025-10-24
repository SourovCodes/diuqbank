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

it('creates a question successfully via API', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    $data = [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => null,
        'pdf' => UploadedFile::fake()->createWithContent('question.pdf', file_get_contents(base_path('public/pdf/fallback-pdf.pdf'))),
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/questions', $data);

    $response->assertCreated();
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

    expect(Question::count())->toBe(1);

    $question = Question::first();
    expect($question->user_id)->toBe($user->id);
    expect($question->department_id)->toBe($department->id);
    expect($question->course_id)->toBe($course->id);
    expect($question->semester_id)->toBe($semester->id);
    expect($question->exam_type_id)->toBe($examType->id);
    expect($question->status)->toBe(QuestionStatus::PUBLISHED);
    expect($question->hasMedia('pdf'))->toBeTrue();
});

it('requires authentication', function () {
    $data = [
        'department_id' => 1,
        'course_id' => 1,
        'semester_id' => 1,
        'exam_type_id' => 1,
        'pdf' => UploadedFile::fake()->create('question.pdf', 1024),
    ];

    $response = $this->postJson('/api/questions', $data);

    $response->assertUnauthorized();
});

it('validates required fields', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/questions', []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['department_id', 'course_id', 'semester_id', 'exam_type_id', 'pdf']);
});

it('validates that course belongs to department', function () {
    $user = User::factory()->create();
    $department1 = Department::factory()->create();
    $department2 = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department2->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    $data = [
        'department_id' => $department1->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'pdf' => UploadedFile::fake()->create('question.pdf', 1024),
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/questions', $data);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['course_id']);
});

it('requires section when exam type requires it', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => true]);

    $data = [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'pdf' => UploadedFile::fake()->create('question.pdf', 1024),
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/questions', $data);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['section']);
});

it('creates question with section when provided', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => true]);

    $data = [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => 'A',
        'pdf' => UploadedFile::fake()->createWithContent('question.pdf', file_get_contents(base_path('public/pdf/fallback-pdf.pdf'))),
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/questions', $data);

    $response->assertCreated();

    $question = Question::first();
    expect($question->section)->toBe('A');
});

it('detects duplicate questions', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    Question::factory()->create([
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => null,
    ]);

    $data = [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => null,
        'pdf' => UploadedFile::fake()->create('question.pdf', 1024),
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/questions', $data);

    $response->assertUnprocessable();
    $response->assertJson([
        'message' => 'A question with these exact details already exists.',
        'errors' => [
            'duplicate' => ['A question with these exact details already exists. Please review and confirm if you want to proceed.'],
        ],
    ]);
});

it('creates question with duplicate reason when confirmed', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    Question::factory()->create([
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => null,
    ]);

    $data = [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => null,
        'pdf' => UploadedFile::fake()->createWithContent('question.pdf', file_get_contents(base_path('public/pdf/fallback-pdf.pdf'))),
        'confirmed_duplicate' => true,
        'duplicate_reason' => 'This is a different version of the same exam',
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/questions', $data);

    $response->assertCreated();
    $response->assertJson([
        'message' => 'Question submitted for review. Our team will verify if it\'s a duplicate and get back to you.',
    ]);

    expect(Question::count())->toBe(2); // Original duplicate + new question

    $question = Question::orderBy('id', 'desc')->first(); // Get the most recently created
    expect($question->status)->toBe(QuestionStatus::PENDING_REVIEW);
    expect($question->under_review_reason)->toBe(UnderReviewReason::DUPLICATE);
    expect($question->duplicate_reason)->toBe('This is a different version of the same exam');
});

it('validates PDF file type', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    $data = [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'pdf' => UploadedFile::fake()->create('question.jpg', 1024),
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/questions', $data);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['pdf']);
});

it('validates PDF file size', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    $data = [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'pdf' => UploadedFile::fake()->create('question.pdf', 11000), // Over 10MB
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/questions', $data);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['pdf']);
});
