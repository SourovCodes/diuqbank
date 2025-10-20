<?php

namespace App\Http\Controllers;

use App\Enums\QuestionStatus;
use App\Enums\UnderReviewReason;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Http\Resources\QuestionDetailResource;
use App\Http\Resources\QuestionResource;
use App\Models\Question;
use App\Repositories\QuestionFormOptionsRepository;
use App\Services\QuestionDuplicateChecker;
use App\Services\QuestionFilterValidator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RalphJSmit\Laravel\SEO\Support\SEOData;

class QuestionsController extends Controller
{
    public function __construct(
        protected QuestionFormOptionsRepository $optionsRepository,
        protected QuestionDuplicateChecker $duplicateChecker,
        protected QuestionFilterValidator $filterValidator,
    ) {}

    /**
     * Generate a descriptive filename/title for the question based on its attributes.
     */
    protected function generateQuestionTitle(Question $question): string
    {
        return $question->course->name.' ('.$question->department->short_name.'), '.$question->semester->name.', '.$question->examType->name;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $departmentId = $request->integer('department_id') ?: null;
        $courseId = $request->integer('course_id') ?: null;
        $semesterId = $request->integer('semester_id') ?: null;
        $examTypeId = $request->integer('exam_type_id') ?: null;
        $uploaderId = $request->integer('uploader') ?: null;

        // Load filter options for validation
        $filterOptions = $this->optionsRepository->getFilterOptions($departmentId);

        // Check for invalid filter parameters
        $invalidParams = $this->filterValidator->getInvalidParams(
            $filterOptions,
            $departmentId,
            $courseId,
            $semesterId,
            $examTypeId
        );

        // If any invalid parameters found, redirect without them
        if (count($invalidParams) > 0) {
            $validParams = $request->except($invalidParams);

            return redirect()->route('questions.index', $validParams);
        }

        $query = Question::query()
            ->published()
            ->department($departmentId)
            ->course($courseId)
            ->semester($semesterId)
            ->examType($examTypeId)
            ->latest()
            ->with(['department', 'semester', 'course', 'examType']);

        $questions = $query->paginate(12)->withQueryString();

        $questions->getCollection()->transform(fn ($question) => QuestionResource::make($question)->resolve());

        return Inertia::render('questions/index', [
            'questions' => $questions,
            'filters' => [
                'department' => $departmentId,
                'semester' => $semesterId,
                'course' => $courseId,
                'examType' => $examTypeId,
            ],
            'filterOptions' => $filterOptions,
        ]);

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $formOptions = $this->optionsRepository->getFormOptions();

        return Inertia::render('questions/create', [
            'formOptions' => $formOptions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreQuestionRequest $request): RedirectResponse
    {
        // Check for duplicate if not confirmed
        if (! $request->boolean('confirmed_duplicate')) {
            $duplicate = $this->duplicateChecker->check($request->validated());

            if ($duplicate) {
                return back()->withErrors([
                    'duplicate' => 'A question with these exact details already exists. Please review and confirm if you want to proceed.',
                ])->withInput();
            }
        }

        $duplicateReason = $request->validated('duplicate_reason');

        $question = Question::create([
            'user_id' => auth()->id(),
            'department_id' => $request->validated('department_id'),
            'course_id' => $request->validated('course_id'),
            'semester_id' => $request->validated('semester_id'),
            'exam_type_id' => $request->validated('exam_type_id'),
            'section' => $request->validated('section'),
            'view_count' => 0,
            'status' => $duplicateReason !== null ? QuestionStatus::PENDING_REVIEW : QuestionStatus::PUBLISHED,
            'under_review_reason' => $duplicateReason !== null ? UnderReviewReason::DUPLICATE : null,
            'duplicate_reason' => $duplicateReason,
        ]);

        if ($request->hasFile('pdf')) {
            $question->load(['course', 'department', 'semester', 'examType']);
            $fileName = $this->generateQuestionTitle($question).'.pdf';
            $question->addMediaFromRequest('pdf')
                ->usingFileName($fileName)
                ->toMediaCollection('pdf');
        }

        $message = $duplicateReason !== null
            ? 'Question submitted for review. Our team will verify if it\'s a duplicate and get back to you.'
            : 'Question created successfully!';

        return redirect()->route('questions.show', $question)->with('success', $message);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): Response
    {
        $cacheKey = "question_{$id}";

        $question = cache()->remember($cacheKey, now()->addHours(24), function () use ($id) {
            return Question::with(['department', 'semester', 'course', 'examType', 'user', 'user.media', 'media'])
                ->findOrFail($id);
        });

        // Check if question is not published and restrict access to owner only
        if ($question->status !== QuestionStatus::PUBLISHED) {
            if (! auth()->check() || auth()->id() !== $question->user_id) {
                $statusMessage = match ($question->status) {
                    QuestionStatus::PENDING_REVIEW => 'This question is pending review and can only be viewed by its owner.',
                    QuestionStatus::NEED_FIX => 'This question needs fixing and can only be viewed by its owner.',
                    default => 'This question is not available for public viewing.'
                };
                abort(403, $statusMessage);
            }
        }

        return Inertia::render('questions/show', [
            'question' => QuestionDetailResource::make($question)->resolve(),
        ])->withViewData([
            'SEOData' => new SEOData(
                title: $this->generateQuestionTitle($question),
            ),
        ]);
    }

    public function incrementView(Question $question): RedirectResponse
    {
        $sessionId = session()->getId();
        $cacheKey = "question_viewed_{$question->id}_{$sessionId}";

        if (! cache()->has($cacheKey)) {
            // Filter out bots
            $ua = strtolower(request()->userAgent() ?? '');
            $isBot = str_contains($ua, 'bot') ||
                     str_contains($ua, 'crawl') ||
                     str_contains($ua, 'spider');

            if (! $isBot) {
                $question->increment('view_count');
            }

            // Prevent multiple counts for next 6 hours
            cache()->put($cacheKey, true, now()->addHours(6));
        }

        return back();
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Question $question): Response
    {
        abort_unless(auth()->check() && auth()->id() === $question->user_id, 403);

        $formOptions = $this->optionsRepository->getFormOptions();

        return Inertia::render('questions/edit', [
            'question' => QuestionDetailResource::make($question)->resolve(),
            'formOptions' => $formOptions,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateQuestionRequest $request, Question $question): RedirectResponse
    {
        // Check for duplicate if not confirmed
        if (! $request->boolean('confirmed_duplicate')) {
            $duplicate = $this->duplicateChecker->check($request->validated(), $question->id);

            if ($duplicate) {
                return back()->withErrors([
                    'duplicate' => 'A question with these exact details already exists. Please review and confirm if you want to proceed.',
                ])->withInput();
            }
        }

        $duplicateReason = $request->validated('duplicate_reason');

        // Check if any of the key parameters changed
        $parametersChanged = $question->department_id !== $request->validated('department_id') ||
                           $question->course_id !== $request->validated('course_id') ||
                           $question->semester_id !== $request->validated('semester_id') ||
                           $question->exam_type_id !== $request->validated('exam_type_id');

        $question->update([
            'department_id' => $request->validated('department_id'),
            'course_id' => $request->validated('course_id'),
            'semester_id' => $request->validated('semester_id'),
            'exam_type_id' => $request->validated('exam_type_id'),
            'section' => $request->validated('section'),
            'status' => $duplicateReason !== null ? QuestionStatus::PENDING_REVIEW : $question->status,
            'under_review_reason' => $duplicateReason !== null ? UnderReviewReason::DUPLICATE : $question->under_review_reason,
            'duplicate_reason' => $duplicateReason,
        ]);

        if ($request->hasFile('pdf')) {
            $question->clearMediaCollection('pdf');
            $fileName = $this->generateQuestionTitle($question).'.pdf';
            $question->addMediaFromRequest('pdf')
                ->usingFileName($fileName)
                ->toMediaCollection('pdf');
        } elseif ($parametersChanged && $question->hasMedia('pdf')) {
            // If parameters changed but no new PDF uploaded, rename existing media
            $media = $question->getFirstMedia('pdf');
            $fileName = $this->generateQuestionTitle($question).'.pdf';
            $media->file_name = $fileName;
            $media->save();
        }

        // Clear cache for this question
        cache()->forget("question_{$question->id}");

        $message = $duplicateReason !== null
            ? 'Question submitted for review. Our team will verify if it\'s a duplicate and get back to you.'
            : 'Question updated successfully!';

        return redirect()->route('questions.show', $question)->with('success', $message);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question): \Illuminate\Http\RedirectResponse
    {
        // Authorize: only the owner can delete their question
        if (auth()->id() !== $question->user_id) {
            abort(403, 'You are not authorized to delete this question.');
        }

        // Clear cache for this question
        cache()->forget("question_{$question->id}");

        // Delete the question
        $question->delete();

        return redirect()->route('questions.index')->with('success', 'Question deleted successfully!');
    }
}
