<?php

namespace App\Http\Controllers;

use App\Http\Resources\QuestionResource;
use App\Models\Question;
use App\Repositories\QuestionFormOptionsRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;
use App\Http\Resources\QuestionDetailResource;

class QuestionsController extends Controller
{
    public function __construct(
        protected QuestionFormOptionsRepository $optionsRepository
    ) {}

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
        $invalidParams = $this->getInvalidFilterParams(
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
        return Inertia::render('questions/create',  $formOptions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
     public function show(Question $question): Response       
    {
        $question->load(['department', 'semester', 'course', 'examType', 'user', 'media']);

        return Inertia::render('questions/show', [
            'question' => QuestionDetailResource::make($question)->resolve(),
        ]);
    }
       public function incrementView(Question $question): RedirectResponse
    {
        // Filter out bots
        $ua = strtolower(request()->userAgent() ?? '');
        $isBot = str_contains($ua, 'bot') ||
                 str_contains($ua, 'crawl') ||
                 str_contains($ua, 'spider');

        if (! $isBot) {
            $question->increment('view_count');
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
    public function update(Request $request, Question $question)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question)
    {
        //
    }

    /**
     * Validate filter parameters and return array of invalid parameter names.
     */
    protected function getInvalidFilterParams(
        array $filterOptions,
        ?int $departmentId,
        ?int $courseId,
        ?int $semesterId,
        ?int $examTypeId
    ): array {
        $invalidParams = [];

        if ($departmentId && ! $filterOptions['departments']->contains('id', $departmentId)) {
            $invalidParams[] = 'department_id';
        }

        if ($courseId && ! $filterOptions['courses']->contains('id', $courseId)) {
            $invalidParams[] = 'course_id';
        }

        if ($semesterId && ! $filterOptions['semesters']->contains('id', $semesterId)) {
            $invalidParams[] = 'semester_id';
        }

        if ($examTypeId && ! $filterOptions['examTypes']->contains('id', $examTypeId)) {
            $invalidParams[] = 'exam_type_id';
        }

        return $invalidParams;
    }
}
