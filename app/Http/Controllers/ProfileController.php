<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;

class ProfileController extends Controller
{

    function createQuestions()
    {
        return view('questions.create');

    }
    function editQuestions(Question $question)
    {
        if ($question->user_id != auth()->user()->id)
            abort(403);
        return view('questions.edit', compact('question'));

    }
    public function edit(Request $request)
    {


        return view('profile.edit', [
            'user' => $request->user(),
        ]);
    }
}
