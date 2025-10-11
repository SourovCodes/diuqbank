<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuestionPageController extends Controller
{
    public function index(Request $request): Response
    {
        $parseFilterId = static function (?string $value): ?int {
            return is_numeric($value)
                ? (int) $value
                : null;
        };

        $departmentId = $parseFilterId($request->input('department'));
        $semesterId = $parseFilterId($request->input('semester'));
        $courseId = $parseFilterId($request->input('course'));
        $examTypeId = $parseFilterId($request->input('examType'));

        $query = Question::query()
            ->with(['department', 'semester', 'course', 'examType', 'user', 'media']);

        // Apply filters
        if ($departmentId !== null) {
            $query->where('department_id', $departmentId);
        }
        if ($semesterId !== null) {
            $query->where('semester_id', $semesterId);
        }
        if ($courseId !== null) {
            $query->where('course_id', $courseId);
        }
        if ($examTypeId !== null) {
            $query->where('exam_type_id', $examTypeId);
        }

        $questions = $query->latest()->paginate(12)->withQueryString();

        // Transform questions to include media URLs
        $questions->getCollection()->transform(function ($question) {
            return [
                'id' => $question->id,
                'created_at' => $question->created_at->toISOString(),
                'view_count' => $question->view_count,
                'pdf_size' => $question->pdf_size,
                'pdf_url' => $question->pdf_url,
                'section' => $question->section,
                'department' => [
                    'id' => $question->department->id,
                    'name' => $question->department->name,
                    'short_name' => $question->department->short_name,
                ],
                'course' => [
                    'id' => $question->course->id,
                    'name' => $question->course->name,
                ],
                'semester' => [
                    'id' => $question->semester->id,
                    'name' => $question->semester->name,
                ],
                'exam_type' => [
                    'id' => $question->examType->id,
                    'name' => $question->examType->name,
                ],
                'user' => [
                    'id' => $question->user->id,
                    'name' => $question->user->name,
                    'username' => $question->user->username ?? null,
                    'student_id' => $question->user->student_id ?? null,
                ],
            ];
        });

        // Get filter options
        $filterOptions = [
            'departments' => Department::select('id', 'short_name as name')->orderBy('short_name')->get()->toArray(),
            'semesters' => Semester::select('id', 'name')->orderByDesc('name')->get()->toArray(),
            'courses' => Course::select('id', 'name', 'department_id')->orderBy('name')->get()->toArray(),
            'examTypes' => ExamType::select('id', 'name')->orderBy('name')->get()->toArray(),
        ];

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

    public function show(Question $question): Response
    {
        $question->load(['department', 'semester', 'course', 'examType', 'user', 'media']);

        // Transform question data to include media URLs
        $questionData = [
            'id' => $question->id,
            'created_at' => $question->created_at->toISOString(),
            'view_count' => $question->view_count,
            'pdf_size' => $question->pdf_size,
            'pdf_url' => $question->pdf_url,
            'section' => $question->section,
            'department' => [
                'id' => $question->department->id,
                'name' => $question->department->name,
                'short_name' => $question->department->short_name,
            ],
            'course' => [
                'id' => $question->course->id,
                'name' => $question->course->name,
            ],
            'semester' => [
                'id' => $question->semester->id,
                'name' => $question->semester->name,
            ],
            'exam_type' => [
                'id' => $question->examType->id,
                'name' => $question->examType->name,
            ],
            'user' => [
                'id' => $question->user->id,
                'name' => $question->user->name,
                'username' => $question->user->username ?? null,
                'student_id' => $question->user->student_id ?? null,
            ],
        ];

        return Inertia::render('questions/show', [
            'question' => $questionData,
        ]);
    }

    public function incrementView(Question $question)
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
}
