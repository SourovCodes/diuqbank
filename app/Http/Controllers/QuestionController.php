<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        return view('questions.livewire');
    }

    public function show(Question $question)
    {


        $question = cache()->remember('question+' . $question->id, 86400, function () use ($question) {
            return $question->loadMissing(['departments', 'semesters', 'exam_types', 'course_names', 'media']);
        });


        return view('questions.show', compact('question'));
    }
    public function pdfViewer(Question $question)
    {


        $question = cache()->remember('question+' . $question->id, 86400, function () use ($question) {
            return $question->loadMissing(['departments', 'semesters', 'exam_types', 'course_names', 'media']);
        });


        return view('pdfViewer', compact('question'));

    }

}
