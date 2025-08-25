<?php

namespace App\Http\Controllers;

use App\Enums\QuestionStatus;
use App\Models\Question;
use App\Models\User;

class ContributorsPageController extends Controller
{
    public function index()
    {
        $contributors = User::has('questions')
            ->withCount('questions')
            ->withSum('questions as total_views', 'view_count')
            ->latest('questions_count')
            ->paginate(12)
            ->withQueryString();

        return view('contributors.index', [
            'contributors' => $contributors,
        ]);
    }

    public function show(User $user)
    {
        $user->loadCount('questions');
        $user->loadSum('questions as total_views', 'view_count');

        $questions = Question::query()
            ->where(function ($q) use ($user) {
                // Show published questions for everyone OR user's own questions regardless of status when viewing own profile
                $q->where('status', QuestionStatus::PUBLISHED);
                if (auth()->check() && auth()->id() === $user->id) {
                    $q->orWhere('user_id', $user->id);
                }
            })
            ->uploader($user->id)
            ->latest()
            ->with(['department', 'semester', 'course', 'examType'])
            ->paginate(12)
            ->withQueryString();

        return view('contributors.show', [
            'contributor' => $user,
            'questions' => $questions,
        ]);
    }
}
