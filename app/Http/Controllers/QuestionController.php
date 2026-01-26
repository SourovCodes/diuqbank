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
            ->when($request->filled('department_id'), fn ($query) => $query->where('department_id', $request->integer('department_id')))
            ->when($request->filled('course_id'), fn ($query) => $query->where('course_id', $request->integer('course_id')))
            ->when($request->filled('semester_id'), fn ($query) => $query->where('semester_id', $request->integer('semester_id')))
            ->when($request->filled('exam_type_id'), fn ($query) => $query->where('exam_type_id', $request->integer('exam_type_id')))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('questions/index', [
            'questions' => QuestionResource::collection($questions),
            'filterOptions' => [
                'departments' => Department::query()->orderBy('name')->get(['id', 'name', 'short_name']),
                'courses' => Course::query()
                    ->when($request->filled('department_id'), fn ($query) => $query->where('department_id', $request->integer('department_id')))
                    ->orderBy('name')
                    ->get(['id', 'name', 'department_id']),
                'semesters' => Semester::query()->orderBy('name')->get(['id', 'name']),
                'examTypes' => ExamType::query()->orderBy('name')->get(['id', 'name']),
            ],
            'filters' => [
                'department' => $request->input('department_id') ? (int) $request->input('department_id') : null,
                'course' => $request->input('course_id') ? (int) $request->input('course_id') : null,
                'semester' => $request->input('semester_id') ? (int) $request->input('semester_id') : null,
                'examType' => $request->input('exam_type_id') ? (int) $request->input('exam_type_id') : null,
            ],
        ]);
    }
}
