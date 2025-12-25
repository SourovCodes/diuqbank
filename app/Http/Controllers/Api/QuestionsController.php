<?php

namespace App\Http\Controllers\Api;

use App\Enums\QuestionStatus;
use App\Enums\UnderReviewReason;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Http\Resources\QuestionDetailResource;
use App\Http\Resources\QuestionResource;
use App\Models\Question;
use App\Services\QuestionDuplicateChecker;
use Illuminate\Http\Request;

class QuestionsController extends Controller
{
    public function __construct(
        protected QuestionDuplicateChecker $duplicateChecker,
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
        $userId = $request->integer('user_id') ?: null;

        $query = Question::query()
            ->published()
            ->department($departmentId)
            ->course($courseId)
            ->semester($semesterId)
            ->examType($examTypeId)
            ->user($userId)
            ->latest()
            ->with(['department', 'semester', 'course', 'examType']);
        $questions = $query->paginate(12)->withQueryString();

        return QuestionResource::collection($questions);

    }

    /**
     * Display a cached listing of the resource.
     */
    public function indexCached(Request $request)
    {
        $departmentId = $request->integer('department_id') ?: null;
        $courseId = $request->integer('course_id') ?: null;
        $semesterId = $request->integer('semester_id') ?: null;
        $examTypeId = $request->integer('exam_type_id') ?: null;
        $userId = $request->integer('user_id') ?: null;
        $page = $request->integer('page') ?: 1;

        $cacheKey = "questions_cached:{$departmentId}:{$courseId}:{$semesterId}:{$examTypeId}:{$userId}:{$page}";

        $questions = cache()->remember($cacheKey, now()->addMinutes(5), function () use ($departmentId, $courseId, $semesterId, $examTypeId, $userId) {
            return Question::query()
                ->published()
                ->department($departmentId)
                ->course($courseId)
                ->semester($semesterId)
                ->examType($examTypeId)
                ->user($userId)
                ->latest()
                ->with(['department', 'semester', 'course', 'examType'])
                ->paginate(12)
                ->withQueryString();
        });

        return QuestionResource::collection($questions);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreQuestionRequest $request)
    {
        // Check for duplicate if not confirmed
        if (! $request->boolean('confirmed_duplicate')) {
            $duplicate = $this->duplicateChecker->check($request->validated());

            if ($duplicate) {
                return response()->json([
                    'message' => 'A question with these exact details already exists.',
                    'errors' => [
                        'duplicate' => ['A question with these exact details already exists. Please review and confirm if you want to proceed.'],
                    ],
                ], 422);
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

        return (new QuestionDetailResource($question->load(['department', 'semester', 'course', 'examType', 'user'])))
            ->additional([
                'message' => $message,
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Question $question)
    {
        return new QuestionDetailResource($question->load(['department', 'semester', 'course', 'examType', 'user']));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Question $question)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateQuestionRequest $request, Question $question)
    {
        // Check for duplicate if not confirmed
        if (! $request->boolean('confirmed_duplicate')) {
            $duplicate = $this->duplicateChecker->check($request->validated(), $question->id);

            if ($duplicate) {
                return response()->json([
                    'message' => 'A question with these exact details already exists.',
                    'errors' => [
                        'duplicate' => ['A question with these exact details already exists. Please review and confirm if you want to proceed.'],
                    ],
                ], 422);
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
            $question->load(['course', 'department', 'semester', 'examType']);
            $fileName = $this->generateQuestionTitle($question).'.pdf';
            $question->addMediaFromRequest('pdf')
                ->usingFileName($fileName)
                ->toMediaCollection('pdf');
        } elseif ($parametersChanged && $question->hasMedia('pdf')) {
            // If parameters changed but no new PDF uploaded, rename existing media
            $question->load(['course', 'department', 'semester', 'examType']);
            $media = $question->getFirstMedia('pdf');
            $fileName = $this->generateQuestionTitle($question).'.pdf';
            $media->file_name = $fileName;
            $media->save();
        }

        $message = $duplicateReason !== null
            ? 'Question submitted for review. Our team will verify if it\'s a duplicate and get back to you.'
            : 'Question updated successfully!';

        return (new QuestionDetailResource($question->load(['department', 'semester', 'course', 'examType', 'user'])))
            ->additional([
                'message' => $message,
            ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question)
    {
        //
    }

    public function filters()
    {

        return response()->json(['data' => [
            'departments' => \App\Models\Department::orderBy('name')->get(['id', 'name']),
            'courses' => \App\Models\Course::orderBy('name')->get(['id', 'name', 'department_id']),
            'semesters' => \App\Models\Semester::orderBy('name')->get(['id', 'name']),
            'exam_types' => \App\Models\ExamType::orderBy('name')->get(['id', 'name']),
        ]]);
    }

    /**
     * Clear the questions cache.
     */
    public function clearCache()
    {
        cache()->forget('questions_cached:*');

        // For cache drivers that support tags or pattern deletion
        if (method_exists(cache()->getStore(), 'flush')) {
            // Clear all keys matching the pattern
            $redis = cache()->getStore()->connection();
            if (method_exists($redis, 'keys')) {
                $keys = $redis->keys(config('cache.prefix').':questions_cached:*');
                foreach ($keys as $key) {
                    $redis->del($key);
                }
            }
        }

        return response()->json(['message' => 'Questions cache cleared successfully.']);
    }
}
