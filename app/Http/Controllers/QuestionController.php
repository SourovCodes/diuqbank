<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Question;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class QuestionController extends Controller
{

    public function home()
    {

        $departments = cache()->remember('departments', now()->addHour(), function () {
            return Department::withCount('questions')->get();
        });

        $questions = cache()->remember('popular-questions', now()->addHour(), function () {
            return Question::take(6)->with(['departments', 'semesters', 'course_names', 'exam_types'])->latest()->get();
        });

        return view('welcome', compact('departments', 'questions'));
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        return view('questions.livewire');
    }

    public function show(Question $question)
    {


        $cacheKey = 'view_count_' . $question->id;
        Cache::increment($cacheKey);
        Cache::put($cacheKey, Cache::get($cacheKey), now()->addMinutes(10));

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

    public function loadprofilepic()
    {
        $response = Http::get('https://diuqbank.live/api/profile_image');

        foreach (User::all() as $user) {


            if ($response->json($user->id) != null) {

                $user->addMediaFromUrl($response->json($user->id))
                    ->toMediaCollection('profile-images', 'profile-images');

            }


        }

    }

}
