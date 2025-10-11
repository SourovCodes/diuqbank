<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class ContributorsPageController extends Controller
{
    public function index(): Response
    {
        $contributors = User::query()
            ->has('questions')
            ->withCount('questions')
            ->withSum('questions as total_views', 'view_count')
            ->orderByDesc('questions_count')
            ->paginate(12)
            ->withQueryString()
            ->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'student_id' => $user->student_id,
                'questions_count' => $user->questions_count,
                'total_views' => $user->total_views ?? 0,
                'profile_picture_url' => $user->getFirstMediaUrl('profile_picture'),
            ]);

        return Inertia::render('contributors/index', [
            'contributors' => $contributors,
        ]);
    }

    public function show(User $user): Response
    {
        $user->loadCount('questions');
        $user->loadSum('questions as total_views', 'view_count');

        $questions = Question::query()
            ->where('user_id', $user->id)
            ->with(['department', 'semester', 'course', 'examType'])
            ->latest()
            ->paginate(12)
            ->withQueryString();

        // Transform questions to match QuestionCard component format
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

        return Inertia::render('contributors/show', [
            'contributor' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'student_id' => $user->student_id,
                'questions_count' => $user->questions_count,
                'total_views' => $user->total_views ?? 0,
                'profile_picture_url' => $user->getFirstMediaUrl('profile_picture'),
            ],
            'questions' => $questions,
        ]);
    }
}
