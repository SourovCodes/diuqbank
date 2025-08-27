<?php

namespace App\Http\Controllers;

use App\Enums\QuestionStatus;
use App\Models\Question;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Get user's questions
        $questions = Question::where('user_id', $user->id)
            ->latest()
            ->with(['department', 'semester', 'course', 'examType'])
            ->paginate(12)
            ->withQueryString();

        // Get user statistics
        $stats = [
            'total_questions' => Question::where('user_id', $user->id)->count(),
            'published_questions' => Question::where('user_id', $user->id)
                ->where('status', QuestionStatus::PUBLISHED)
                ->count(),
            'pending_questions' => Question::where('user_id', $user->id)
                ->where('status', QuestionStatus::PENDING_REVIEW)
                ->count(),
            'need_fix_questions' => Question::where('user_id', $user->id)
                ->where('status', QuestionStatus::NEED_FIX)
                ->count(),
            'total_views' => Question::where('user_id', $user->id)
                ->sum('view_count'),
        ];

        return view('dashboard', [
            'questions' => $questions,
            'stats' => $stats,
            'user' => $user,
        ]);
    }
}
