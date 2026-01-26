<?php

namespace App\Http\Controllers;

use App\Enums\QuestionStatus;
use App\Http\Resources\QuestionResource;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    public function index(Request $request): Response
    {
        $questions = Question::query()
            ->with(['department', 'course', 'semester', 'examType'])
            ->where('status', QuestionStatus::Published)
            ->when($request->filled('department'), fn ($query) => $query->where('department_id', $request->integer('department')))
            ->when($request->filled('course'), fn ($query) => $query->where('course_id', $request->integer('course')))
            ->when($request->filled('semester'), fn ($query) => $query->where('semester_id', $request->integer('semester')))
            ->when($request->filled('exam_type'), fn ($query) => $query->where('exam_type_id', $request->integer('exam_type')))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('questions/index', [
            'questions' => QuestionResource::collection($questions),
            'departments' => Department::query()->orderBy('name')->get(['id', 'name', 'short_name']),
            'courses' => Course::query()
                ->when($request->filled('department'), fn ($query) => $query->where('department_id', $request->integer('department')))
                ->orderBy('name')
                ->get(['id', 'name', 'department_id']),
            'semesters' => Semester::query()->orderBy('name')->get(['id', 'name']),
            'examTypes' => ExamType::query()->orderBy('name')->get(['id', 'name']),
            'filters' => [
                'department' => $request->input('department'),
                'course' => $request->input('course'),
                'semester' => $request->input('semester'),
                'exam_type' => $request->input('exam_type'),
            ],
        ]);
    }
}
