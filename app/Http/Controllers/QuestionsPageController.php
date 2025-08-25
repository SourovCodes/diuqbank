<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class QuestionsPageController extends Controller
{
    public function index(Request $request)
    {
        $departmentId = $request->integer('department_id') ?: null;
        $courseId = $request->integer('course_id') ?: null;
        $semesterId = $request->integer('semester_id') ?: null;
        $examTypeId = $request->integer('exam_type_id') ?: null;
        $uploaderId = $request->integer('uploader') ?: null;

        $query = Question::query()
            ->where(function ($q) {
                // Show published questions for everyone OR user's own questions regardless of status
                $q->where('status', \App\Enums\QuestionStatus::PUBLISHED);
                if (auth()->check()) {
                    $q->orWhere('user_id', auth()->id());
                }
            })
            ->uploader($uploaderId)
            ->department($departmentId)
            ->course($courseId)
            ->semester($semesterId)
            ->examType($examTypeId)
            ->latest()
            ->with(['department', 'semester', 'course', 'examType']);

        $questions = $query->paginate(12)->withQueryString();

        $dropdownData = [
            'departments' => Department::active()->select('id', 'short_name as name')->orderBy('short_name')->get(),
            'courses' => Course::active()->select('id', 'name', 'department_id')->orderBy('name')->get(),
            'semesters' => Semester::active()->select('id', 'name')->orderByLatest()->get(),
            'exam_types' => ExamType::active()->select('id', 'name')->orderBy('name')->get(),
        ];

        return view('questions.index', [
            'questions' => $questions,
            'dropdownData' => $dropdownData,
            'filters' => [
                'department_id' => $departmentId,
                'course_id' => $courseId,
                'semester_id' => $semesterId,
                'exam_type_id' => $examTypeId,
            ],
        ]);
    }

    public function show(Question $question)
    {
        // Check if question is not published and restrict access to owner only
        if ($question->status !== \App\Enums\QuestionStatus::PUBLISHED) {
            if (!auth()->check() || auth()->id() !== $question->user_id) {
                $statusMessage = match($question->status) {
                    \App\Enums\QuestionStatus::PENDING_REVIEW => 'This question is pending review and can only be viewed by its owner.',
                    \App\Enums\QuestionStatus::REJECTED => 'This question has been rejected and can only be viewed by its owner.',
                    default => 'This question is not available for public viewing.'
                };
                abort(403, $statusMessage);
            }
        }

        $question->load(['department', 'semester', 'course', 'examType', 'user']);
       
        $sessionId = session()->getId();
        $cacheKey = "question_viewed_{$question->id}_{$sessionId}";

        if (!cache()->has($cacheKey)) {
            // Filter out bots
            $ua = strtolower(request()->userAgent() ?? '');
            $isBot = str_contains($ua, 'bot') || 
                     str_contains($ua, 'crawl') || 
                     str_contains($ua, 'spider');
            
            if (!$isBot) {
                $question->increment('view_count');
            }
    
            // Prevent multiple counts for next 6 hours
            cache()->put($cacheKey, true, now()->addHours(6));
        }
   

        return view('questions.show', [
            'question' => $question,
        ]);
    }

    public function create()
    {
        $dropdownData = [
            'departments' => Department::active()->select('id', 'short_name as name')->orderBy('short_name')->get(),
            'courses' => Course::active()->select('id', 'name', 'department_id')->orderBy('name')->get(),
            'semesters' => Semester::active()->select('id', 'name')->orderByLatest()->get(),
            'exam_types' => ExamType::active()->select('id', 'name', 'requires_section')->orderBy('name')->get(),
        ];

        return view('questions.create', [
            'dropdownData' => $dropdownData,
        ]);
    }

    public function edit(Question $question)
    {
        // Ensure only the owner can edit the question
        if ($question->user_id !== auth()->id()) {
            toast('You can only edit your own questions.', 'error');
            abort(403, 'Unauthorized');
        }

        $question->load(['department', 'semester', 'course', 'examType']);

        $dropdownData = [
            'departments' => Department::active()->select('id', 'short_name as name')->orderBy('short_name')->get(),
            'courses' => Course::active()->select('id', 'name', 'department_id')->orderBy('name')->get(),
            'semesters' => Semester::active()->select('id', 'name')->orderByLatest()->get(),
            'exam_types' => ExamType::active()->select('id', 'name', 'requires_section')->orderBy('name')->get(),
        ];

        return view('questions.edit', [
            'question' => $question,
            'dropdownData' => $dropdownData,
        ]);
    }

    public function destroy(Question $question)
    {
        // Ensure only the owner can delete the question
        if ($question->user_id !== auth()->id()) {
            toast('You can only delete your own questions.', 'error');
            abort(403, 'Unauthorized');
        }

        // Delete the PDF file from S3 if it exists
        if ($question->pdf_key && Storage::disk('s3')->exists($question->pdf_key)) {
            Storage::disk('s3')->delete($question->pdf_key);
        }

        // Delete the question record
        $question->delete();

        toast('Question deleted successfully! 🗑️', 'success');

        return redirect()->route('questions.index');
    }
}


