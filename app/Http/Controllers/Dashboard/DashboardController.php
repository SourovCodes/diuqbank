<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $stats = [
            'total_submissions' => Submission::where('user_id', $user->id)->count(),
            'published' => Submission::where('user_id', $user->id)
                ->whereHas('question', fn ($q) => $q->where('status', 'published'))
                ->count(),
            'pending_review' => Submission::where('user_id', $user->id)
                ->whereHas('question', fn ($q) => $q->where('status', 'pending_review'))
                ->count(),
            'rejected' => Submission::where('user_id', $user->id)
                ->whereHas('question', fn ($q) => $q->where('status', 'rejected'))
                ->count(),
        ];

        $recentSubmissions = Submission::with(['question.course', 'question.department', 'question.semester', 'question.examType'])
            ->where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('dashboard/index', [
            'stats' => $stats,
            'recentSubmissions' => $recentSubmissions,
        ]);
    }
}
