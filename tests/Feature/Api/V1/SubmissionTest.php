<?php

use App\Enums\QuestionStatus;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    $this->user = User::factory()->create();
    $this->department = Department::factory()->create();
    $this->course = Course::factory()->create(['department_id' => $this->department->id]);
    $this->semester = Semester::factory()->create();
    $this->examType = ExamType::factory()->create();
});

describe('index submissions', function () {
    it('returns paginated submissions for authenticated user', function () {
        // Create questions with varied courses to avoid unique constraints
        for ($i = 0; $i < 20; $i++) {
            $course = Course::factory()->create(['department_id' => $this->department->id]);
            $question = Question::factory()->create([
                'department_id' => $this->department->id,
                'course_id' => $course->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
            ]);
            Submission::factory()->create([
                'user_id' => $this->user->id,
                'question_id' => $question->id,
            ]);
        }

        // Create submissions for other users (should not be returned)
        Submission::factory()->count(3)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/submissions');

        $response->assertStatus(200)
            ->assertJsonCount(15, 'data') // Paginated to 15 per page
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'question' => [
                            'id',
                            'department',
                            'course',
                            'semester',
                            'exam_type',
                            'views',
                            'created_at',
                        ],
                        'views',
                        'pdf_url',
                        'upvote_count',
                        'downvote_count',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'links',
                'meta',
            ]);
    });

    it('returns only current user submissions', function () {
        $otherUser = User::factory()->create();

        // Create submissions for current user
        for ($i = 0; $i < 3; $i++) {
            $course = Course::factory()->create(['department_id' => $this->department->id]);
            $question = Question::factory()->create([
                'department_id' => $this->department->id,
                'course_id' => $course->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
            ]);
            Submission::factory()->create([
                'user_id' => $this->user->id,
                'question_id' => $question->id,
            ]);
        }

        // Create submissions for other user
        for ($i = 0; $i < 5; $i++) {
            $course = Course::factory()->create(['department_id' => $this->department->id]);
            $question = Question::factory()->create([
                'department_id' => $this->department->id,
                'course_id' => $course->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
            ]);
            Submission::factory()->create([
                'user_id' => $otherUser->id,
                'question_id' => $question->id,
            ]);
        }

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/submissions');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    });

    it('requires authentication', function () {
        $response = $this->getJson('/api/v1/submissions');

        $response->assertStatus(401);
    });

    it('returns empty list when user has no submissions', function () {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/submissions');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    });
});

describe('store submission', function () {
    it('can create a submission with a new question', function () {
        $pdf = createFakePdf('question.pdf', 1024);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/submissions', [
                'department_id' => $this->department->id,
                'course_id' => $this->course->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
                'pdf' => $pdf,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'question' => [
                        'id',
                        'views',
                        'created_at',
                    ],
                    'views',
                    'pdf_url',
                    'upvote_count',
                    'downvote_count',
                    'created_at',
                    'updated_at',
                ],
            ]);

        $this->assertDatabaseHas('questions', [
            'department_id' => $this->department->id,
            'course_id' => $this->course->id,
            'semester_id' => $this->semester->id,
            'exam_type_id' => $this->examType->id,
        ]);

        $this->assertDatabaseHas('submissions', [
            'user_id' => $this->user->id,
        ]);
    });

    it('can create a submission for an existing question', function () {
        $question = Question::factory()->create([
            'department_id' => $this->department->id,
            'course_id' => $this->course->id,
            'semester_id' => $this->semester->id,
            'exam_type_id' => $this->examType->id,
        ]);

        $pdf = createFakePdf('question.pdf', 1024);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/submissions', [
                'department_id' => $this->department->id,
                'course_id' => $this->course->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
                'pdf' => $pdf,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'question' => [
                        'id' => $question->id,
                    ],
                ],
            ]);

        $this->assertDatabaseCount('questions', 1);
        $this->assertDatabaseCount('submissions', 1);
    });

    it('sets new question status to published when all parameters have published questions', function () {
        // Create published questions for each parameter
        Question::factory()->create([
            'department_id' => $this->department->id,
            'status' => QuestionStatus::Published,
        ]);
        Question::factory()->create([
            'course_id' => $this->course->id,
            'status' => QuestionStatus::Published,
        ]);
        Question::factory()->create([
            'semester_id' => $this->semester->id,
            'status' => QuestionStatus::Published,
        ]);
        Question::factory()->create([
            'exam_type_id' => $this->examType->id,
            'status' => QuestionStatus::Published,
        ]);

        $pdf = createFakePdf('question.pdf', 1024);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/submissions', [
                'department_id' => $this->department->id,
                'course_id' => $this->course->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
                'pdf' => $pdf,
            ]);

        $response->assertStatus(201);

        $question = Question::where('department_id', $this->department->id)
            ->where('course_id', $this->course->id)
            ->where('semester_id', $this->semester->id)
            ->where('exam_type_id', $this->examType->id)
            ->first();

        expect($question->status)->toBe(QuestionStatus::Published);
    });

    it('sets new question status to pending review when not all parameters have published questions', function () {
        $pdf = createFakePdf('question.pdf', 1024);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/submissions', [
                'department_id' => $this->department->id,
                'course_id' => $this->course->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
                'pdf' => $pdf,
            ]);

        $response->assertStatus(201);

        $question = Question::where('department_id', $this->department->id)
            ->where('course_id', $this->course->id)
            ->first();

        expect($question->status)->toBe(QuestionStatus::PendingReview);
    });

    it('requires authentication', function () {
        $pdf = createFakePdf('question.pdf', 1024);

        $response = $this->postJson('/api/v1/submissions', [
            'department_id' => $this->department->id,
            'course_id' => $this->course->id,
            'semester_id' => $this->semester->id,
            'exam_type_id' => $this->examType->id,
            'pdf' => $pdf,
        ]);

        $response->assertStatus(401);
    });

    it('requires all fields', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/submissions', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['department_id', 'course_id', 'semester_id', 'exam_type_id', 'pdf']);
    });

    it('validates pdf file is required', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/submissions', [
                'department_id' => $this->department->id,
                'course_id' => $this->course->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pdf']);
    });

    it('validates pdf file must be a pdf', function () {
        $file = UploadedFile::fake()->create('document.txt', 1024);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/submissions', [
                'department_id' => $this->department->id,
                'course_id' => $this->course->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
                'pdf' => $file,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pdf']);
    });

    it('validates pdf file size must not exceed 10MB', function () {
        $pdf = createFakePdf('question.pdf', 10241); // 10MB + 1KB

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/submissions', [
                'department_id' => $this->department->id,
                'course_id' => $this->course->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
                'pdf' => $pdf,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pdf']);
    });

    it('is rate limited to 10 requests per minute', function () {
        for ($i = 0; $i < 10; $i++) {
            $pdf = createFakePdf("question{$i}.pdf", 1024);

            $department = Department::factory()->create();
            $course = Course::factory()->create(['department_id' => $department->id]);

            $response = $this->actingAs($this->user)
                ->postJson('/api/v1/submissions', [
                    'department_id' => $department->id,
                    'course_id' => $course->id,
                    'semester_id' => $this->semester->id,
                    'exam_type_id' => $this->examType->id,
                    'pdf' => $pdf,
                ]);

            $response->assertStatus(201);
        }

        $pdf = createFakePdf('rate-limited.pdf', 1024);
        $department = Department::factory()->create();
        $course = Course::factory()->create(['department_id' => $department->id]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/submissions', [
                'department_id' => $department->id,
                'course_id' => $course->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
                'pdf' => $pdf,
            ]);

        $response->assertStatus(429);
    });
});

describe('update submission', function () {
    it('can update submission pdf', function () {
        $question = Question::factory()->create([
            'department_id' => $this->department->id,
            'course_id' => $this->course->id,
            'semester_id' => $this->semester->id,
            'exam_type_id' => $this->examType->id,
        ]);

        $submission = Submission::factory()->create([
            'question_id' => $question->id,
            'user_id' => $this->user->id,
        ]);

        $pdf = createFakePdf('updated-question.pdf', 2048);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/v1/submissions/{$submission->id}", [
                'pdf' => $pdf,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $submission->id,
                ],
            ]);
    });

    it('can update submission question parameters', function () {
        $question = Question::factory()->create();
        $submission = Submission::factory()->create([
            'question_id' => $question->id,
            'user_id' => $this->user->id,
        ]);

        $newDepartment = Department::factory()->create();
        $newCourse = Course::factory()->create(['department_id' => $newDepartment->id]);
        $newSemester = Semester::factory()->create();
        $newExamType = ExamType::factory()->create();

        $response = $this->actingAs($this->user)
            ->patchJson("/api/v1/submissions/{$submission->id}", [
                'department_id' => $newDepartment->id,
                'course_id' => $newCourse->id,
                'semester_id' => $newSemester->id,
                'exam_type_id' => $newExamType->id,
            ]);

        $response->assertStatus(200);

        // Verify the submission's question was updated
        $submission->refresh();
        $updatedQuestion = $submission->question;

        expect($updatedQuestion->department_id)->toBe($newDepartment->id);
        expect($updatedQuestion->course_id)->toBe($newCourse->id);
        expect($updatedQuestion->semester_id)->toBe($newSemester->id);
        expect($updatedQuestion->exam_type_id)->toBe($newExamType->id);
    });

    it('can update submission pdf and question parameters together', function () {
        $question = Question::factory()->create();
        $submission = Submission::factory()->create([
            'question_id' => $question->id,
            'user_id' => $this->user->id,
        ]);

        $newDepartment = Department::factory()->create();
        $newCourse = Course::factory()->create(['department_id' => $newDepartment->id]);
        $pdf = createFakePdf('new-question.pdf', 2048);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/v1/submissions/{$submission->id}", [
                'department_id' => $newDepartment->id,
                'course_id' => $newCourse->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
                'pdf' => $pdf,
            ]);

        $response->assertStatus(200);

        $submission->refresh();
        expect($submission->question->department_id)->toBe($newDepartment->id);
        expect($submission->getFirstMediaUrl('pdf'))->not()->toBeEmpty();
    });

    it('requires authentication', function () {
        $submission = Submission::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $pdf = createFakePdf('updated-question.pdf', 1024);

        $response = $this->patchJson("/api/v1/submissions/{$submission->id}", [
            'pdf' => $pdf,
        ]);

        $response->assertStatus(401);
    });

    it('only allows owner to update submission', function () {
        $otherUser = User::factory()->create();

        $submission = Submission::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $pdf = createFakePdf('updated-question.pdf', 1024);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/v1/submissions/{$submission->id}", [
                'pdf' => $pdf,
            ]);

        $response->assertStatus(403);
    });

    it('requires at least one field for update', function () {
        $submission = Submission::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/v1/submissions/{$submission->id}", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pdf']);
    });

    it('is rate limited to 10 requests per minute', function () {
        // Create 11 different questions with varied courses to avoid unique constraints
        $questions = collect();
        for ($i = 0; $i < 11; $i++) {
            $course = Course::factory()->create(['department_id' => $this->department->id]);
            $questions->push(Question::factory()->create([
                'department_id' => $this->department->id,
                'course_id' => $course->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
            ]));
        }

        for ($i = 0; $i < 10; $i++) {
            $submission = Submission::factory()->create([
                'question_id' => $questions[$i]->id,
                'user_id' => $this->user->id,
            ]);

            $pdf = createFakePdf("updated{$i}.pdf", 1024);

            $response = $this->actingAs($this->user)
                ->patchJson("/api/v1/submissions/{$submission->id}", [
                    'pdf' => $pdf,
                ]);

            $response->assertStatus(200);
        }

        $submission = Submission::factory()->create([
            'question_id' => $questions[10]->id,
            'user_id' => $this->user->id,
        ]);

        $pdf = createFakePdf('rate-limited.pdf', 1024);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/v1/submissions/{$submission->id}", [
                'pdf' => $pdf,
            ]);

        $response->assertStatus(429);
    });

    it('deletes votes when question is changed', function () {
        $question = Question::factory()->create([
            'department_id' => $this->department->id,
            'course_id' => $this->course->id,
            'semester_id' => $this->semester->id,
            'exam_type_id' => $this->examType->id,
        ]);

        $submission = Submission::factory()->create([
            'question_id' => $question->id,
            'user_id' => $this->user->id,
        ]);

        // Create some votes
        $voter = User::factory()->create();
        $submission->upvote($voter);

        expect($submission->votes()->count())->toBe(1);

        $newDepartment = Department::factory()->create();
        $newCourse = Course::factory()->create(['department_id' => $newDepartment->id]);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/v1/submissions/{$submission->id}", [
                'department_id' => $newDepartment->id,
                'course_id' => $newCourse->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
            ]);

        $response->assertStatus(200);

        // Votes should be deleted when question changes
        expect($submission->fresh()->votes()->count())->toBe(0);
    });
});

describe('delete submission', function () {
    it('can delete own submission', function () {
        $submission = Submission::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/submissions/{$submission->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('submissions', ['id' => $submission->id]);
    });

    it('cannot delete other user submission', function () {
        $otherUser = User::factory()->create();
        $submission = Submission::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/submissions/{$submission->id}");

        $response->assertStatus(403);
    });

    it('requires authentication', function () {
        $submission = Submission::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->deleteJson("/api/v1/submissions/{$submission->id}");

        $response->assertStatus(401);
    });
});

describe('store submission validation', function () {
    it('validates course belongs to department', function () {
        $otherDepartment = Department::factory()->create();
        $courseFromOtherDepartment = Course::factory()->create(['department_id' => $otherDepartment->id]);

        $pdf = createFakePdf('question.pdf', 1024);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/submissions', [
                'department_id' => $this->department->id,
                'course_id' => $courseFromOtherDepartment->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
                'pdf' => $pdf,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['course_id']);
    });

    it('prevents duplicate submission for same question', function () {
        $question = Question::factory()->create([
            'department_id' => $this->department->id,
            'course_id' => $this->course->id,
            'semester_id' => $this->semester->id,
            'exam_type_id' => $this->examType->id,
        ]);

        Submission::factory()->create([
            'question_id' => $question->id,
            'user_id' => $this->user->id,
        ]);

        $pdf = createFakePdf('duplicate.pdf', 1024);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/submissions', [
                'department_id' => $this->department->id,
                'course_id' => $this->course->id,
                'semester_id' => $this->semester->id,
                'exam_type_id' => $this->examType->id,
                'pdf' => $pdf,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['question']);
    });
});

describe('update submission validation', function () {
    it('validates course belongs to department when updating', function () {
        $question = Question::factory()->create([
            'department_id' => $this->department->id,
            'course_id' => $this->course->id,
            'semester_id' => $this->semester->id,
            'exam_type_id' => $this->examType->id,
        ]);

        $submission = Submission::factory()->create([
            'question_id' => $question->id,
            'user_id' => $this->user->id,
        ]);

        $otherDepartment = Department::factory()->create();
        $courseFromOtherDepartment = Course::factory()->create(['department_id' => $otherDepartment->id]);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/v1/submissions/{$submission->id}", [
                'department_id' => $this->department->id,
                'course_id' => $courseFromOtherDepartment->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['course_id']);
    });
});

describe('submission voting', function () {
    it('prevents user from voting on own submission', function () {
        $question = Question::factory()->create([
            'department_id' => $this->department->id,
            'course_id' => $this->course->id,
            'semester_id' => $this->semester->id,
            'exam_type_id' => $this->examType->id,
            'status' => QuestionStatus::Published,
        ]);

        $submission = Submission::factory()->create([
            'question_id' => $question->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/submissions/{$submission->id}/upvote");

        $response->assertStatus(403)
            ->assertJson(['message' => 'You cannot vote on your own submission.']);
    });

    it('allows other users to upvote submission', function () {
        $submissionOwner = User::factory()->create();
        $question = Question::factory()->create([
            'department_id' => $this->department->id,
            'course_id' => $this->course->id,
            'semester_id' => $this->semester->id,
            'exam_type_id' => $this->examType->id,
            'status' => QuestionStatus::Published,
        ]);

        $submission = Submission::factory()->create([
            'question_id' => $question->id,
            'user_id' => $submissionOwner->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/submissions/{$submission->id}/upvote");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'vote',
                    'upvote_count',
                    'downvote_count',
                ],
            ])
            ->assertJson([
                'data' => [
                    'vote' => 1,
                    'upvote_count' => 1,
                    'downvote_count' => 0,
                ],
            ]);
    });

    it('allows other users to downvote submission', function () {
        $submissionOwner = User::factory()->create();
        $question = Question::factory()->create([
            'department_id' => $this->department->id,
            'course_id' => $this->course->id,
            'semester_id' => $this->semester->id,
            'exam_type_id' => $this->examType->id,
            'status' => QuestionStatus::Published,
        ]);

        $submission = Submission::factory()->create([
            'question_id' => $question->id,
            'user_id' => $submissionOwner->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/submissions/{$submission->id}/downvote");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'vote' => -1,
                    'upvote_count' => 0,
                    'downvote_count' => 1,
                ],
            ]);
    });

    it('returns 404 for non-published question submissions', function () {
        $question = Question::factory()->create([
            'department_id' => $this->department->id,
            'course_id' => $this->course->id,
            'semester_id' => $this->semester->id,
            'exam_type_id' => $this->examType->id,
            'status' => QuestionStatus::PendingReview,
        ]);

        $submissionOwner = User::factory()->create();
        $submission = Submission::factory()->create([
            'question_id' => $question->id,
            'user_id' => $submissionOwner->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/submissions/{$submission->id}/upvote");

        $response->assertStatus(404);
    });
});
