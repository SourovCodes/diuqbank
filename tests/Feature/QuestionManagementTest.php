<?php

use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\get;

beforeEach(function () {
    Storage::fake('public');
});

test('guest cannot access question create page', function () {
    get(route('questions.create'))->assertRedirect(route('login'));
});

test('authenticated user can access question create page', function () {
    $user = User::factory()->create();
    $user->markEmailAsVerified();

    actingAs($user)
        ->get(route('questions.create'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('questions/create'));
});

test('authenticated user can create a question', function () {
    $this->withoutExceptionHandling();

    $user = User::factory()->create();
    $user->markEmailAsVerified();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    // Create a real PDF file for testing
    $pdfContent = "%PDF-1.4\n%����\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n211\n%%EOF";
    $pdf = UploadedFile::fake()->createWithContent('question.pdf', $pdfContent);

    actingAs($user)
        ->post(route('questions.store'), [
            'department_id' => $department->id,
            'course_id' => $course->id,
            'semester_id' => $semester->id,
            'exam_type_id' => $examType->id,
            'pdf' => $pdf,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    assertDatabaseHas('questions', [
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ]);
});

test('section is required when exam type requires it', function () {
    $user = User::factory()->create();
    $user->markEmailAsVerified();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => true]);

    // Create a real PDF file for testing
    $pdfContent = "%PDF-1.4\n%����\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n211\n%%EOF";
    $pdf = UploadedFile::fake()->createWithContent('question.pdf', $pdfContent);

    actingAs($user)
        ->post(route('questions.store'), [
            'department_id' => $department->id,
            'course_id' => $course->id,
            'semester_id' => $semester->id,
            'exam_type_id' => $examType->id,
            'pdf' => $pdf,
        ])
        ->assertSessionHasErrors('section');
});

test('course must belong to selected department when creating question', function () {
    $user = User::factory()->create();
    $user->markEmailAsVerified();
    $department1 = Department::factory()->create();
    $department2 = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department1->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    // Create a real PDF file for testing
    $pdfContent = "%PDF-1.4\n%����\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n211\n%%EOF";
    $pdf = UploadedFile::fake()->createWithContent('question.pdf', $pdfContent);

    actingAs($user)
        ->post(route('questions.store'), [
            'department_id' => $department2->id, // Different department
            'course_id' => $course->id, // Course belongs to department1
            'semester_id' => $semester->id,
            'exam_type_id' => $examType->id,
            'pdf' => $pdf,
        ])
        ->assertSessionHasErrors('course_id');
});

test('authenticated user can create question with section when required', function () {
    $this->withoutExceptionHandling();

    $user = User::factory()->create();
    $user->markEmailAsVerified();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => true]);

    // Create a real PDF file for testing
    $pdfContent = "%PDF-1.4\n%����\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n211\n%%EOF";
    $pdf = UploadedFile::fake()->createWithContent('question.pdf', $pdfContent);

    actingAs($user)
        ->post(route('questions.store'), [
            'department_id' => $department->id,
            'course_id' => $course->id,
            'semester_id' => $semester->id,
            'exam_type_id' => $examType->id,
            'section' => 'A',
            'pdf' => $pdf,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    assertDatabaseHas('questions', [
        'user_id' => $user->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => 'A',
    ]);
});

test('question creation validates required fields', function () {
    $user = User::factory()->create();
    $user->markEmailAsVerified();

    actingAs($user)
        ->post(route('questions.store'), [])
        ->assertSessionHasErrors(['department_id', 'course_id', 'semester_id', 'exam_type_id', 'pdf']);
});

test('guest cannot access question edit page', function () {
    $question = Question::factory()->create();

    get(route('questions.edit', $question))->assertRedirect(route('login'));
});

test('user can only edit their own questions', function () {
    $user = User::factory()->create();
    $user->markEmailAsVerified();
    $otherUser = User::factory()->create();
    $question = Question::factory()->create(['user_id' => $otherUser->id]);

    actingAs($user)
        ->get(route('questions.edit', $question))
        ->assertForbidden();
});

test('user can access edit page for their own question', function () {
    $user = User::factory()->create();
    $user->markEmailAsVerified();
    $question = Question::factory()->create(['user_id' => $user->id]);

    actingAs($user)
        ->get(route('questions.edit', $question))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('questions/edit'));
});

test('user can update their own question', function () {
    $user = User::factory()->create();
    $user->markEmailAsVerified();
    $department1 = Department::factory()->create();
    $department2 = Department::factory()->create();
    $course1 = Course::factory()->create(['department_id' => $department1->id]);
    $course2 = Course::factory()->create(['department_id' => $department2->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    $question = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department1->id,
        'course_id' => $course1->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ]);

    actingAs($user)
        ->put(route('questions.update', $question), [
            'department_id' => $department2->id,
            'course_id' => $course2->id,
            'semester_id' => $semester->id,
            'exam_type_id' => $examType->id,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    assertDatabaseHas('questions', [
        'id' => $question->id,
        'department_id' => $department2->id,
        'course_id' => $course2->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ]);
});

test('user cannot update another users question', function () {
    $user = User::factory()->create();
    $user->markEmailAsVerified();
    $otherUser = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    $question = Question::factory()->create([
        'user_id' => $otherUser->id,
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ]);

    actingAs($user)
        ->put(route('questions.update', $question), [
            'department_id' => $department->id,
            'course_id' => $course->id,
            'semester_id' => $semester->id,
            'exam_type_id' => $examType->id,
        ])
        ->assertForbidden();
});

test('course must belong to selected department when updating question', function () {
    $user = User::factory()->create();
    $user->markEmailAsVerified();
    $department1 = Department::factory()->create();
    $department2 = Department::factory()->create();
    $course1 = Course::factory()->create(['department_id' => $department1->id]);
    $course2 = Course::factory()->create(['department_id' => $department2->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    $question = Question::factory()->create([
        'user_id' => $user->id,
        'department_id' => $department1->id,
        'course_id' => $course1->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ]);

    actingAs($user)
        ->put(route('questions.update', $question), [
            'department_id' => $department1->id,
            'course_id' => $course2->id, // Course belongs to department2, not department1
            'semester_id' => $semester->id,
            'exam_type_id' => $examType->id,
        ])
        ->assertSessionHasErrors('course_id');
});

test('user can update question with new pdf', function () {
    $user = User::factory()->create();
    $user->markEmailAsVerified();
    $question = Question::factory()->create(['user_id' => $user->id]);

    // Create a real PDF file for testing
    $pdfContent = "%PDF-1.4\n%����\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n211\n%%EOF";
    $newPdf = UploadedFile::fake()->createWithContent('new-question.pdf', $pdfContent);

    actingAs($user)
        ->put(route('questions.update', $question), [
            'department_id' => $question->department_id,
            'course_id' => $question->course_id,
            'semester_id' => $question->semester_id,
            'exam_type_id' => $question->exam_type_id,
            'section' => $question->section,
            'pdf' => $newPdf,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($question->fresh()->getFirstMedia('pdf'))->not->toBeNull();
});
