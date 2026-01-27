<?php

namespace App\Http\Controllers\Dashboard;

use App\Enums\QuestionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubmissionRequest;
use App\Http\Requests\UpdateSubmissionRequest;
use App\Models\Question;
use App\Models\Submission;
use App\Repositories\QuestionFormOptionsRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionController extends Controller
{
    public function __construct(private QuestionFormOptionsRepository $optionsRepository) {}

    public function index(Request $request): Response
    {
        $submissions = Submission::query()
            ->where('user_id', $request->user()->id)
            ->with(['question.department', 'question.course', 'question.semester', 'question.examType', 'media'])
            ->withSum('votes as vote_score', 'value')
            ->latest()
            ->paginate(12);

        return Inertia::render('dashboard/submissions/index', [
            'submissions' => [
                'data' => $submissions->map(fn (Submission $submission) => [
                    'id' => $submission->id,
                    'pdf_url' => $submission->getFirstMediaUrl('pdf'),
                    'vote_score' => (int) ($submission->vote_score ?? 0),
                    'views' => $submission->views,
                    'created_at' => $submission->created_at->toISOString(),
                    'question' => [
                        'id' => $submission->question->id,
                        'status' => $submission->question->status->value,
                        'status_label' => $submission->question->status->getLabel(),
                        'department' => [
                            'id' => $submission->question->department->id,
                            'name' => $submission->question->department->name,
                            'short_name' => $submission->question->department->short_name,
                        ],
                        'course' => [
                            'id' => $submission->question->course->id,
                            'name' => $submission->question->course->name,
                        ],
                        'semester' => [
                            'id' => $submission->question->semester->id,
                            'name' => $submission->question->semester->name,
                        ],
                        'exam_type' => [
                            'id' => $submission->question->examType->id,
                            'name' => $submission->question->examType->name,
                        ],
                    ],
                ]),
                'current_page' => $submissions->currentPage(),
                'last_page' => $submissions->lastPage(),
                'per_page' => $submissions->perPage(),
                'total' => $submissions->total(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('dashboard/submissions/create', [
            'formOptions' => $this->optionsRepository->getFormOptions(),
        ]);
    }

    public function store(StoreSubmissionRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Find or create question with the given configuration
        $question = $this->findOrCreateQuestion(
            $validated['department_id'],
            $validated['course_id'],
            $validated['semester_id'],
            $validated['exam_type_id']
        );

        // Create submission
        $submission = Submission::create([
            'question_id' => $question->id,
            'user_id' => $request->user()->id,
        ]);

        // Handle PDF upload
        $submission->addMediaFromRequest('pdf')->toMediaCollection('pdf');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Submission created successfully!',
            'description' => 'Your question paper has been submitted for review.',
        ]);

        return redirect()->route('dashboard.submissions.index');
    }

    public function edit(Submission $submission): Response
    {
        abort_unless($submission->user_id === auth()->id(), 403);

        $submission->load(['question.department', 'question.course', 'question.semester', 'question.examType', 'media']);

        return Inertia::render('dashboard/submissions/edit', [
            'submission' => [
                'id' => $submission->id,
                'department_id' => $submission->question->department_id,
                'course_id' => $submission->question->course_id,
                'semester_id' => $submission->question->semester_id,
                'exam_type_id' => $submission->question->exam_type_id,
                'pdf_url' => $submission->getFirstMediaUrl('pdf'),
                'pdf_name' => $submission->getFirstMedia('pdf')?->file_name,
            ],
            'formOptions' => $this->optionsRepository->getFormOptions(),
        ]);
    }

    public function update(UpdateSubmissionRequest $request, Submission $submission): RedirectResponse
    {
        $validated = $request->validated();

        // Find or create question with the new configuration
        $question = $this->findOrCreateQuestion(
            $validated['department_id'],
            $validated['course_id'],
            $validated['semester_id'],
            $validated['exam_type_id']
        );

        // Update submission's question
        $submission->update(['question_id' => $question->id]);

        // Handle PDF upload if provided
        if ($request->hasFile('pdf')) {
            $submission->addMediaFromRequest('pdf')->toMediaCollection('pdf');
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Submission updated successfully!',
        ]);

        return redirect()->route('dashboard.submissions.index');
    }

    private function findOrCreateQuestion(int $departmentId, int $courseId, int $semesterId, int $examTypeId): Question
    {
        // Try to find existing question with the same configuration
        $question = Question::query()
            ->where('department_id', $departmentId)
            ->where('course_id', $courseId)
            ->where('semester_id', $semesterId)
            ->where('exam_type_id', $examTypeId)
            ->first();

        if ($question) {
            return $question;
        }

        // Determine status for new question
        $status = $this->determineNewQuestionStatus($departmentId, $courseId, $semesterId, $examTypeId);

        return Question::create([
            'department_id' => $departmentId,
            'course_id' => $courseId,
            'semester_id' => $semesterId,
            'exam_type_id' => $examTypeId,
            'status' => $status,
        ]);
    }

    private function determineNewQuestionStatus(int $departmentId, int $courseId, int $semesterId, int $examTypeId): QuestionStatus
    {
        // Check if each parameter has at least one published question
        $hasPublishedDepartment = Question::where('department_id', $departmentId)
            ->where('status', QuestionStatus::Published)
            ->exists();

        $hasPublishedCourse = Question::where('course_id', $courseId)
            ->where('status', QuestionStatus::Published)
            ->exists();

        $hasPublishedSemester = Question::where('semester_id', $semesterId)
            ->where('status', QuestionStatus::Published)
            ->exists();

        $hasPublishedExamType = Question::where('exam_type_id', $examTypeId)
            ->where('status', QuestionStatus::Published)
            ->exists();

        // If all 4 parameters have at least one published question, auto-publish
        if ($hasPublishedDepartment && $hasPublishedCourse && $hasPublishedSemester && $hasPublishedExamType) {
            return QuestionStatus::Published;
        }

        return QuestionStatus::PendingReview;
    }
}
