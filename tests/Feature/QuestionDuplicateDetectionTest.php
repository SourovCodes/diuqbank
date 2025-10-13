<?php

use App\Enums\QuestionStatus;
use App\Enums\UnderReviewReason;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    Storage::fake('public');

    $this->user = User::factory()->create();
    $this->department = Department::factory()->create();
    $this->semester = Semester::factory()->create();
    $this->course = Course::factory()->create(['department_id' => $this->department->id]);
    $this->examType = ExamType::factory()->create(['requires_section' => true]);
});

it('detects duplicate when creating a question with the same attributes', function () {
    // Create an existing question
    Question::factory()->create([
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'A',
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $response = actingAs($this->user)->from(route('questions.create'))->post(route('questions.store'), [
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'A',
        'pdf' => UploadedFile::fake()->create('question.pdf', 100, 'application/pdf'),
        'confirmed_duplicate' => false,
    ]);

    $response->assertRedirect(route('questions.create'))
        ->assertSessionHasErrors(['duplicate']);

    expect(session('errors')->first('duplicate'))->toContain('already exists');
});

it('allows creating a question with duplicate_reason when duplicate exists', function () {
    // Create an existing question
    Question::factory()->create([
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'A',
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $response = actingAs($this->user)->from(route('questions.create'))->post(route('questions.store'), [
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'A',
        'pdf' => UploadedFile::fake()->create('question.pdf', 100, 'application/pdf'),
        'duplicate_reason' => 'This is actually from a different year',
        'confirmed_duplicate' => true,
    ]);

    $response->assertRedirect();

    $question = Question::latest()->first();

    expect($question)
        ->department_id->toBe($this->department->id)
        ->course_id->toBe($this->course->id)
        ->semester_id->toBe($this->semester->id)
        ->exam_type_id->toBe($this->examType->id)
        ->section->toBe('A')
        ->status->toBe(QuestionStatus::PENDING_REVIEW)
        ->under_review_reason->toBe(UnderReviewReason::DUPLICATE)
        ->duplicate_reason->toBe('This is actually from a different year');
});

it('creates a question without duplicate_reason when no duplicate exists', function () {
    $response = actingAs($this->user)->post(route('questions.store'), [
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'A',
        'pdf' => UploadedFile::fake()->create('question.pdf', 100, 'application/pdf'),
    ]);

    $response->assertRedirect();

    $question = Question::latest()->first();

    expect($question)
        ->status->toBe(QuestionStatus::PUBLISHED)
        ->under_review_reason->toBeNull()
        ->duplicate_reason->toBeNull();
});

it('allows creating a question with different section', function () {
    Question::factory()->create([
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'A',
    ]);

    $response = actingAs($this->user)->post(route('questions.store'), [
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'B',
        'pdf' => UploadedFile::fake()->create('question.pdf', 100, 'application/pdf'),
    ]);

    $response->assertRedirect();

    expect(Question::count())->toBe(2);
});

it('detects duplicate when updating a question to match another', function () {
    $existingQuestion = Question::factory()->create([
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'A',
        'user_id' => $this->user->id,
    ]);

    $questionToUpdate = Question::factory()->create([
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'B',
        'user_id' => $this->user->id,
    ]);

    $response = actingAs($this->user)->from(route('questions.edit', $questionToUpdate))->put(route('questions.update', $questionToUpdate), [
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'A', // Changing to match existing question
        'confirmed_duplicate' => false,
        '_method' => 'PUT',
    ]);

    $response->assertRedirect(route('questions.edit', $questionToUpdate))
        ->assertSessionHasErrors(['duplicate']);
});

it('allows updating a question with duplicate_reason when duplicate exists', function () {
    Question::factory()->create([
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'A',
    ]);

    $questionToUpdate = Question::factory()->create([
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'B',
        'user_id' => $this->user->id,
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $response = actingAs($this->user)->from(route('questions.edit', $questionToUpdate))->put(route('questions.update', $questionToUpdate), [
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'A',
        'duplicate_reason' => 'Different exam date',
        'confirmed_duplicate' => true,
        '_method' => 'PUT',
    ]);

    $response->assertRedirect();

    $questionToUpdate->refresh();

    expect($questionToUpdate)
        ->section->toBe('A')
        ->status->toBe(QuestionStatus::PENDING_REVIEW)
        ->under_review_reason->toBe(UnderReviewReason::DUPLICATE)
        ->duplicate_reason->toBe('Different exam date');
});

it('allows updating a question without changing to duplicate', function () {
    $question = Question::factory()->create([
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'A',
        'user_id' => $this->user->id,
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $response = actingAs($this->user)->put(route('questions.update', $question), [
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $this->examType->id,
        'section' => 'A', // Same as before
        '_method' => 'PUT',
    ]);

    $response->assertRedirect();

    $question->refresh();

    expect($question)
        ->status->toBe(QuestionStatus::PUBLISHED)
        ->under_review_reason->toBeNull();
});

it('treats null and empty section as duplicate', function () {
    $examTypeNoSection = ExamType::factory()->create(['requires_section' => false]);

    Question::factory()->create([
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $examTypeNoSection->id,
        'section' => null,
    ]);

    $response = actingAs($this->user)->from(route('questions.create'))->post(route('questions.store'), [
        'department_id' => $this->department->id,
        'course_id' => $this->course->id,
        'semester_id' => $this->semester->id,
        'exam_type_id' => $examTypeNoSection->id,
        'section' => '',
        'pdf' => UploadedFile::fake()->create('question.pdf', 100, 'application/pdf'),
        'confirmed_duplicate' => false,
    ]);

    $response->assertRedirect(route('questions.create'))
        ->assertSessionHasErrors(['duplicate']);
});
