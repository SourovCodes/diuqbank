<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SubmissionVoteController extends Controller
{
    public function upvote(Request $request, Submission $submission): RedirectResponse
    {
        $user = $request->user();
        $currentVote = $submission->getUserVote($user);

        if ($currentVote === 1) {
            $submission->removeVote($user);
        } else {
            $submission->upvote($user);
        }

        return back();
    }

    public function downvote(Request $request, Submission $submission): RedirectResponse
    {
        $user = $request->user();
        $currentVote = $submission->getUserVote($user);

        if ($currentVote === -1) {
            $submission->removeVote($user);
        } else {
            $submission->downvote($user);
        }

        return back();
    }
}
