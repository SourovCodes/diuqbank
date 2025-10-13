<?php

namespace App\Http\Controllers;

use App\Http\Resources\QuestionResource;
use App\Models\Question;
use App\Repositories\QuestionFormOptionsRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

        // Validate filter parameters and collect invalid ones
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

        // If any invalid parameters found, redirect without them
        if (count($invalidParams) > 0) {
            $validParams = $request->except($invalidParams);

            return redirect()->route('questions.index', $validParams);
        }

        $query = Question::query()
            ->where(function ($q) {
                // Show published questions for everyone OR user's own questions regardless of status
                $q->where('status', \App\Enums\QuestionStatus::PUBLISHED);
                if (auth()->check()) {
                    $q->orWhere('user_id', auth()->id());
                }
            })
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
    public function create()
    {
        //
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
    public function show(Question $question)
    {
        //
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
}
