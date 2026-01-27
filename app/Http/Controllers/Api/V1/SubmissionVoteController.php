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

        $vote = $submission->upvote($request->user());

        return response()->json([
            'data' => [
                'vote' => $vote->value,
            ],
        ]);
    }

    /**
     * Downvote a submission.
     */
    public function downvote(Request $request, Submission $submission): JsonResponse
    {
        $this->ensureQuestionIsPublished($submission);

        $vote = $submission->downvote($request->user());

        return response()->json([
            'data' => [
                'vote' => $vote->value,
            ],
        ]);
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
     * Ensure the submission's question is published.
     */
    private function ensureQuestionIsPublished(Submission $submission): void
    {
        abort_unless($submission->question->status === QuestionStatus::Published, 404);
    }
}
