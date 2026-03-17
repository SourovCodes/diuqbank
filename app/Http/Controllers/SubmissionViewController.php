<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubmissionViewController extends Controller
{
    /**
     * Track a view for a submission with session-based abuse prevention.
     * Views are only counted once per session per submission.
     */
    public function __invoke(Request $request, Submission $submission): JsonResponse
    {
        $sessionKey = 'viewed_submissions';
        $viewedSubmissions = $request->session()->get($sessionKey, []);

        // Check if this submission has already been viewed in this session
        if (in_array($submission->id, $viewedSubmissions, true)) {
            return response()->json([
                'success' => true,
                'views' => $submission->views,
                'already_viewed' => true,
            ]);
        }

        // Increment the view count
        $submission->increment('views');

        // Mark as viewed in session
        $viewedSubmissions[] = $submission->id;
        $request->session()->put($sessionKey, $viewedSubmissions);

        return response()->json([
            'success' => true,
            'views' => $submission->fresh()->views,
            'already_viewed' => false,
        ]);
    }
}
