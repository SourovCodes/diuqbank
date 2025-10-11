<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuestionPageController extends Controller
{
    public function index(Request $request)
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

        $departmentOptions = Department::select('id', 'short_name as name')->orderBy('short_name')->get();
        $semesterOptions = Semester::select('id', 'name')->get();
        $allCourseOptions = Course::select('id', 'name', 'department_id')->orderBy('name')->get();
        $examTypeOptions = ExamType::select('id', 'name')->orderBy('name')->get();

        $invalidFiltersDetected = false;

        if ($departmentId !== null && ! $departmentOptions->contains('id', $departmentId)) {
            $departmentId = null;
            $invalidFiltersDetected = true;
        }

        if ($semesterId !== null && ! $semesterOptions->contains('id', $semesterId)) {
            $semesterId = null;
            $invalidFiltersDetected = true;
        }

        if ($courseId !== null) {
            $course = $allCourseOptions->firstWhere('id', $courseId);

            if ($course === null) {
                $courseId = null;
                $invalidFiltersDetected = true;
            } elseif ($departmentId !== null && (int) $course->department_id !== $departmentId) {
                $courseId = null;
                $invalidFiltersDetected = true;
            }
        }

        if ($examTypeId !== null && ! $examTypeOptions->contains('id', $examTypeId)) {
            $examTypeId = null;
            $invalidFiltersDetected = true;
        }

        if ($invalidFiltersDetected) {
            $queryParams = array_filter([
                'department' => $departmentId,
                'semester' => $semesterId,
                'course' => $courseId,
                'examType' => $examTypeId,
                'page' => $request->integer('page') > 1 ? $request->integer('page') : null,
            ], static fn ($value) => $value !== null);

            return redirect()->route('questions.index', $queryParams);
        }

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

        $semesterSeasonOrder = [
            'spring' => 1,
            'summer' => 2,
            'short' => 3,
            'fall' => 4,
        ];

        $semesterOptions = $semesterOptions
            ->sort(function (Semester $a, Semester $b) use ($semesterSeasonOrder): int {
                $extractSortData = static function (Semester $semester) use ($semesterSeasonOrder): array {
                    $matches = [];
                    preg_match('/^(?<season>[A-Za-z]+)\s+(?<year>\d{2,4})$/', $semester->name, $matches);

                    $seasonKey = strtolower($matches['season'] ?? '');
                    $seasonRank = $semesterSeasonOrder[$seasonKey] ?? 99;
                    $year = isset($matches['year']) ? (int) $matches['year'] : 0;

                    if (isset($matches['year']) && strlen($matches['year']) === 2) {
                        $year += 2000;
                    }

                    return [$year, $seasonRank];
                };

                [$yearA, $seasonRankA] = $extractSortData($a);
                [$yearB, $seasonRankB] = $extractSortData($b);

                if ($yearA === $yearB) {
                    return $seasonRankA <=> $seasonRankB;
                }

                return $yearB <=> $yearA;
            })
            ->values();

        $questions = $query->latest()->paginate(12)->withQueryString();

        // Transform questions to include media URLs
        $questions->getCollection()->transform(function ($question) {
            return [
                'id' => $question->id,
                'created_at' => $question->created_at->toISOString(),
                'view_count' => $question->view_count,
                'section' => $question->section,
                'department' => $question->department->short_name,
                'course' => $question->course->name,
                'semester' => $question->semester->name,
                'exam_type' => $question->examType->name,
              
            ];
        });

        $visibleCourseOptions = $departmentId !== null
            ? $allCourseOptions
                ->where('department_id', $departmentId)
                ->values()
            : $allCourseOptions;

        // Get filter options
        $filterOptions = [
            'departments' => $departmentOptions->toArray(),
            'semesters' => $semesterOptions->toArray(),
            'courses' => $visibleCourseOptions->toArray(),
            'examTypes' => $examTypeOptions->toArray(),
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
