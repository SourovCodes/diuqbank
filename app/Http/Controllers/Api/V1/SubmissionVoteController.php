<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\QuestionStatus;
use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubmissionVoteController extends Controller
{
    /**
     * Upvote a submission.
     */
    public function upvote(Request $request, Submission $submission): JsonResponse
    {
        $this->ensureQuestionIsPublished($submission);
        $this->ensureNotOwnSubmission($request, $submission);

        $vote = $submission->upvote($request->user());

        return $this->voteResponse($submission, $vote->value);
    }

    /**
     * Downvote a submission.
     */
    public function downvote(Request $request, Submission $submission): JsonResponse
    {
        $this->ensureQuestionIsPublished($submission);
        $this->ensureNotOwnSubmission($request, $submission);

        $vote = $submission->downvote($request->user());

        return $this->voteResponse($submission, $vote->value);
    }

    /**
     * Remove vote from a submission.
     */
    public function destroy(Request $request, Submission $submission): JsonResponse
    {
        $this->ensureQuestionIsPublished($submission);

        $submission->removeVote($request->user());

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
     * Ensure the submission's question is published.
     */
    private function ensureQuestionIsPublished(Submission $submission): void
    {
        $submission->loadMissing('question');

        abort_unless($submission->question->status === QuestionStatus::Published, 404);
    }

    /**
     * Ensure the user is not voting on their own submission.
     */
    private function ensureNotOwnSubmission(Request $request, Submission $submission): void
    {
        abort_if(
            $submission->user_id === $request->user()->id,
            403,
            'You cannot vote on your own submission.'
        );
    }

    /**
     * Return a standardized vote response with updated counts.
     */
    private function voteResponse(Submission $submission, int $voteValue): JsonResponse
    {
        $submission->loadCount([
            'votes as upvotes_count' => fn ($query) => $query->where('value', 1),
            'votes as downvotes_count' => fn ($query) => $query->where('value', -1),
        ]);

        return response()->json([
            'data' => [
                'vote' => $voteValue,
                'upvote_count' => (int) $submission->upvotes_count,
                'downvote_count' => (int) $submission->downvotes_count,
            ],
        ]);
    }
}
