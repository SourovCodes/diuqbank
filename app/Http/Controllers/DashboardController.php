<?php

namespace App\Http\Controllers;

use App\Enums\QuestionStatus;
use App\Http\Resources\QuestionResource;
use App\Models\Question;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the user's dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get statistics for the authenticated user
        $stats = [
            'total_questions' => Question::query()
                ->where('user_id', $user->id)
                ->count(),
            'published' => Question::query()
                ->where('user_id', $user->id)
                ->where('status', QuestionStatus::PUBLISHED)
                ->count(),
            'pending_review' => Question::query()
                ->where('user_id', $user->id)
                ->where('status', QuestionStatus::PENDING_REVIEW)
                ->count(),
            'need_fix' => Question::query()
                ->where('user_id', $user->id)
                ->where('status', QuestionStatus::NEED_FIX)
                ->count(),
            'total_views' => Question::query()
                ->where('user_id', $user->id)
                ->sum('view_count'),
        ];

        // Get user's questions with pagination
        $questions = Question::query()
            ->where('user_id', $user->id)
            ->latest()
            ->with(['department', 'semester', 'course', 'examType'])
            ->paginate(10)
            ->withQueryString();

        $questions->getCollection()->transform(fn ($question) => QuestionResource::make($question)->resolve());

        return Inertia::render('dashboard/index', [
            'stats' => $stats,
            'questions' => $questions,
        ]);
    }
}
