<?php

use App\Models\Question;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

it('returns public submissions with full related metadata and original pdf temporary link', function () {
    Storage::fake('submissions');
    Storage::fake('submissions-conversions');

    $question = Question::factory()->published()->create();
    $user = User::factory()->create();

    $submission = Submission::factory()->create([
        'question_id' => $question->id,
        'user_id' => $user->id,
    ]);

    $submission
        ->addMediaFromString('%PDF-1.4 test file')
        ->usingFileName('submission.pdf')
        ->toMediaCollection('pdf');

    $response = $this->getJson(route('public.submissions.index'));

    $response
        ->assertOk()
        ->assertJsonPath('data.0.id', $submission->id)
        ->assertJsonPath('data.0.created_at', $submission->created_at->toISOString())
        ->assertJsonPath('data.0.user.email', $user->email)
        ->assertJsonPath('data.0.user.name', $user->name)
        ->assertJsonPath('data.0.user.username', $user->username)
        ->assertJsonPath('data.0.user.student_id', $user->student_id)
        ->assertJsonPath('data.0.department.short_name', $question->department->short_name)
        ->assertJsonPath('data.0.course.name', $question->course->name)
        ->assertJsonPath('data.0.semester.name', $question->semester->name)
        ->assertJsonPath('data.0.exam_type.name', $question->examType->name)
        ->assertJsonStructure([
            'data' => [[
                'id',
                'views',
                'created_at',
                'pdf_original_temporary_url',
                'user' => [
                    'name',
                    'username',
                    'student_id',
                    'email',
                    'avatar_url',
                ],
                'department',
                'course',
                'semester',
                'exam_type',
            ]],
        ]);

    expect($response->json('data.0.pdf_original_temporary_url'))->not()->toBeNull();
});
