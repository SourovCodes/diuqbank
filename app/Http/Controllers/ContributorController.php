<?php

namespace App\Http\Controllers;

use App\Enums\QuestionStatus;
use App\Http\Resources\ContributorResource;
use App\Http\Resources\SubmissionResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ContributorController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $cacheKey = 'contributors:index:'.md5((string) json_encode([
            'search' => $search,
            'page' => $request->integer('page', 1),
        ]));

        $contributors = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($search) {
            return User::query()
                ->has('submissions')
                ->withContributorStats()
                ->when($search !== '', fn ($query) => $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%'.$search.'%')
                        ->orWhere('username', 'like', '%'.$search.'%');
                }))
                ->orderByDesc('submissions_count')
                ->paginate(24)
                ->withQueryString();
        });

        return Inertia::render('contributors/index', [
            'contributors' => ContributorResource::collection($contributors),
            'filters' => [
                'search' => $search,
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
