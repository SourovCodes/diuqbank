<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\QuestionStatus;
use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\User;
use App\Services\QuestionCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubmissionVoteController extends Controller
{
    public function __construct(
        protected QuestionCacheService $cacheService
    ) {}

    /**
     * Upvote a submission.
     */
    public function upvote(Request $request, Submission $submission): JsonResponse
    {
        $this->ensureCanVote($request->user(), $submission);

        $vote = $submission->upvote($request->user());

        $this->cacheService->clearQuestionCache($submission->question_id);

        return $this->voteResponse($submission, $vote->value);
    }

    /**
     * Downvote a submission.
     */
    public function downvote(Request $request, Submission $submission): JsonResponse
    {
        $this->ensureCanVote($request->user(), $submission);

        $vote = $submission->downvote($request->user());

        $this->cacheService->clearQuestionCache($submission->question_id);

        return $this->voteResponse($submission, $vote->value);
    }

    /**
     * Remove vote from a submission.
     */
    public function destroy(Request $request, Submission $submission): JsonResponse
    {
        $this->ensureQuestionIsPublished($submission);

        $submission->removeVote($request->user());

        $this->cacheService->clearQuestionCache($submission->question_id);

        return response()->json(null, 204);
    }

    /**
     * Get the authenticated user's vote for a submission.
     */
    public function show(Request $request, Submission $submission): JsonResponse
    {
        $this->ensureQuestionIsPublished($submission);

        $vote = $submission->getUserVote($request->user());

        return response()->json([
            'data' => [
                'vote' => $vote,
            ],
        ]);
    }

    /**
     * Ensure the user can vote on this submission.
     */
    private function ensureCanVote(User $user, Submission $submission): void
    {
        $this->ensureQuestionIsPublished($submission);

        abort_if(
            $submission->user_id === $user->id,
            403,
            'You cannot vote on your own submission.'
        );
    }

    /**
     * Ensure the submission's question is published.
     */
    private function ensureQuestionIsPublished(Submission $submission): void
    {
        $submission->loadMissing('question');

        abort_unless($submission->question->status === QuestionStatus::Published, 404);
    }

    /**
     * Return a standardized vote response with updated counts.
     */
    private function voteResponse(Submission $submission, int $voteValue): JsonResponse
    {
        $submission->loadVoteCounts();

        return response()->json([
            'data' => [
                'vote' => $voteValue,
                'upvote_count' => (int) $submission->upvotes_count,
                'downvote_count' => (int) $submission->downvotes_count,
            ],
        ]);
    }
}
