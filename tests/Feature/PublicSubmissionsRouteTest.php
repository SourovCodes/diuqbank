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
        ->assertJsonPath('data.0.user.id', $user->id)
        ->assertJsonPath('data.0.user.email', $user->email)
        ->assertJsonPath('data.0.user.name', $user->name)
        ->assertJsonPath('data.0.user.username', $user->username)
        ->assertJsonPath('data.0.question.id', $question->id)
        ->assertJsonPath('data.0.question.department.id', $question->department_id)
        ->assertJsonPath('data.0.question.course.id', $question->course_id)
        ->assertJsonPath('data.0.question.semester.id', $question->semester_id)
        ->assertJsonPath('data.0.question.exam_type.id', $question->exam_type_id)
        ->assertJsonStructure([
            'data' => [[
                'id',
                'question_id',
                'user_id',
                'section',
                'views',
                'pdf_url',
                'pdf_original_temporary_url',
                'vote_score',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'username',
                    'avatar_url',
                ],
                'question' => [
                    'id',
                    'department_id',
                    'course_id',
                    'semester_id',
                    'exam_type_id',
                    'status',
                    'title',
                    'department',
                    'course',
                    'semester',
                    'exam_type',
                ],
            ]],
        ]);

    expect($response->json('data.0.pdf_original_temporary_url'))->not()->toBeNull();
});
