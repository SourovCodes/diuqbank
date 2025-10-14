<?php

use App\Enums\QuestionStatus;
use App\Enums\UnderReviewReason;
use App\Filament\Resources\Questions\Pages\EditQuestion;
use App\Models\Question;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;

beforeEach(function () {
    Storage::fake('public');
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('displays the PDF viewer when under review reason is duplicate and question has a PDF', function () {
    $question = Question::factory()->create([
        'user_id' => $this->user->id,
        'status' => QuestionStatus::PENDING_REVIEW,
        'under_review_reason' => UnderReviewReason::DUPLICATE,
    ]);

    // Create a valid PDF file with content
    $pdfContent = "%PDF-1.4\n%¿÷¢þ\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n198\n%%EOF";
    $file = UploadedFile::fake()->createWithContent('question.pdf', $pdfContent);
    $question->addMedia($file)->toMediaCollection('pdf');

    Livewire::test(EditQuestion::class, [
        'record' => $question->id,
    ])
        ->assertSee('Current Question (Duplicate)')
        ->assertSee('Open');
});

it('does not display PDF viewer when under review reason is not duplicate', function () {
    $question = Question::factory()->create([
        'user_id' => $this->user->id,
        'status' => QuestionStatus::PENDING_REVIEW,
        'under_review_reason' => UnderReviewReason::NEW_USER,
    ]);

    $pdfContent = "%PDF-1.4\n%¿÷¢þ\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n198\n%%EOF";
    $file = UploadedFile::fake()->createWithContent('question.pdf', $pdfContent);
    $question->addMedia($file)->toMediaCollection('pdf');

    Livewire::test(EditQuestion::class, [
        'record' => $question->id,
    ])
        ->assertDontSee('Current Question (Duplicate)');
});

it('does not display PDF viewer when question has no PDF', function () {
    $question = Question::factory()->create([
        'user_id' => $this->user->id,
        'status' => QuestionStatus::PENDING_REVIEW,
        'under_review_reason' => UnderReviewReason::DUPLICATE,
    ]);

    Livewire::test(EditQuestion::class, [
        'record' => $question->id,
    ])
        ->assertDontSee('Current Question (Duplicate)');
});

it('does not display PDF viewer when status is not pending review', function () {
    $question = Question::factory()->create([
        'user_id' => $this->user->id,
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $pdfContent = "%PDF-1.4\n%¿÷¢þ\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n198\n%%EOF";
    $file = UploadedFile::fake()->createWithContent('question.pdf', $pdfContent);
    $question->addMedia($file)->toMediaCollection('pdf');

    Livewire::test(EditQuestion::class, [
        'record' => $question->id,
    ])
        ->assertDontSee('Current Question (Duplicate)');
});

it('can edit question details with PDF viewer visible when duplicate', function () {
    $question = Question::factory()->create([
        'user_id' => $this->user->id,
        'status' => QuestionStatus::PENDING_REVIEW,
        'under_review_reason' => UnderReviewReason::DUPLICATE,
    ]);

    $pdfContent = "%PDF-1.4\n%¿÷¢þ\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n198\n%%EOF";
    $file = UploadedFile::fake()->createWithContent('question.pdf', $pdfContent);
    $question->addMedia($file)->toMediaCollection('pdf');

    Livewire::test(EditQuestion::class, [
        'record' => $question->id,
    ])
        ->assertSee('Current Question (Duplicate)')
        ->assertFormSet([
            'user_id' => $question->user_id,
            'department_id' => $question->department_id,
            'course_id' => $question->course_id,
            'status' => $question->status,
            'under_review_reason' => $question->under_review_reason,
        ])
        ->assertSuccessful();
});

it('displays original question PDF when duplicate found', function () {
    // Create the original question first
    $originalQuestion = Question::factory()->create([
        'user_id' => $this->user->id,
        'status' => QuestionStatus::PUBLISHED,
    ]);

    $pdfContent = "%PDF-1.4\n%¿÷¢þ\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n198\n%%EOF";
    $file = UploadedFile::fake()->createWithContent('original.pdf', $pdfContent);
    $originalQuestion->addMedia($file)->toMediaCollection('pdf');

    // Create duplicate question with same criteria
    $duplicateQuestion = Question::factory()->create([
        'user_id' => $this->user->id,
        'department_id' => $originalQuestion->department_id,
        'course_id' => $originalQuestion->course_id,
        'semester_id' => $originalQuestion->semester_id,
        'exam_type_id' => $originalQuestion->exam_type_id,
        'section' => $originalQuestion->section,
        'status' => QuestionStatus::PENDING_REVIEW,
        'under_review_reason' => UnderReviewReason::DUPLICATE,
    ]);

    $duplicateFile = UploadedFile::fake()->createWithContent('duplicate.pdf', $pdfContent);
    $duplicateQuestion->addMedia($duplicateFile)->toMediaCollection('pdf');

    Livewire::test(EditQuestion::class, [
        'record' => $duplicateQuestion->id,
    ])
        ->assertSee('Current Question (Duplicate)')
        ->assertSee('Original Question (Published)')
        ->assertSee('Edit Original');
});
