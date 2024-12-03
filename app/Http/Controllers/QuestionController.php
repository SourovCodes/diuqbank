<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Question;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class QuestionController extends Controller
{

    public function home()
    {

        $departments = cache()->remember('departments', now()->addHour(), function () {
            return  Department::withCount('questions')->get();
        });

        $questions = cache()->remember('popular-questions',  now()->addHour(), function () {
            return Question::take(6)->with(['departments', 'semesters', 'course_names', 'exam_types'])->latest()->get();
        });

        return view('welcome', compact('departments','questions'));
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


//        $cacheKey = 'view_count_' . $question->id;
//        Cache::increment($cacheKey);
//        Cache::put($cacheKey, Cache::get($cacheKey), now()->addHour());

//        $question = cache()->remember('question+' . $question->id, now()->addHour(), function () use ($question) {
//            return $question->loadMissing(['departments', 'semesters', 'exam_types', 'course_names', 'media']);
//        });
//        $question->view_count = $question->view_count + Cache::get($cacheKey);

	    $question->loadMissing(['departments', 'semesters', 'exam_types', 'course_names', 'media']);

        $semesters = implode(', ', $question->semesters->pluck('name')->toArray());
        $departments = implode(', ', $question->departments->pluck('name')->toArray());
        $course_names = implode(', ', $question->course_names->pluck('name')->toArray());
        $exam_types = implode(', ', $question->exam_types->pluck('name')->toArray());
        $SEOData = new \RalphJSmit\Laravel\SEO\Support\SEOData(
            title: $question->title,
            description: "Department: $departments | Semesters: $semesters | Course Name: $course_names | Exam Types: $exam_types",
            author: $question->user->name,
        //            image: asset('images/DIU-QBank-social-share.png'),
        );
	    $question->increment('view_count');
        return view('questions.show', compact('question', 'SEOData'));
    }
    public function pdfViewer(Question $question)
    {


        $question = cache()->remember('question+' . $question->id, 86400, function () use ($question) {
            return $question->loadMissing(['departments', 'semesters', 'exam_types', 'course_names', 'media']);
        });


        return view('pdfViewer', compact('question'));

    }

}
