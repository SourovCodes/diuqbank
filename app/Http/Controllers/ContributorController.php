<?php

namespace App\Http\Controllers;

use App\Enums\QuestionStatus;
use App\Http\Resources\ContributorResource;
use App\Http\Resources\SubmissionResource;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContributorController extends Controller
{
    public function index(Request $request): Response
    {
        $contributors = User::query()
            ->has('submissions')
            ->withContributorStats()
            ->when($request->filled('search'), fn ($query) => $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->input('search').'%')
                    ->orWhere('username', 'like', '%'.$request->input('search').'%');
            }))
            ->orderByDesc('submissions_count')
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('contributors/index', [
            'contributors' => ContributorResource::collection($contributors),
            'filters' => [
                'search' => $request->input('search'),
            ],
        ]);
    }

    public function show(User $user): Response
    {
        $user->loadCount('submissions')
            ->loadSum(['submissions as total_votes' => function ($query) {
                $query->join('votes', 'submissions.id', '=', 'votes.submission_id');
            }], 'votes.value')
            ->loadSum('submissions', 'views');

        $submissions = $user->submissions()
            ->with(['question.department', 'question.course', 'question.semester', 'question.examType', 'media'])
            ->withSum('votes', 'value')
            ->whereHas('question', fn ($q) => $q->where('status', QuestionStatus::Published))
            ->orderByDesc('votes_sum_value')
            ->paginate(12);

        return Inertia::render('contributors/show', [
            'contributor' => (new ContributorResource($user))->resolve(),
            'submissions' => SubmissionResource::collection($submissions),
        ]);
    }
}
