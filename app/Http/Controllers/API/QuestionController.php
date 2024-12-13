<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CourseName;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filter = (object) [
            'semester' => $request->input('semester'),
            'course_name' => $request->input('course_name'),
            'department' => $request->input('department'),
            'exam_type' => $request->input('exam_type'),
            'qsearch' => $request->input('qsearch')
        ];

       return $questions = Question::with(['course_names', 'semesters', 'departments', 'exam_types'])
            ->filter($filter)->paginate(50);
    }


    public function getFilterOptions()
    {
        return [
            'course_name'=>CourseName::all()->sortBy('name'),
            'department'=>Department::all()->sortBy('name'),
            'semester'=>Semester::all()->sortBy('name'),
            'exam_type'=>ExamType::all()->sortBy('name'),
        ];
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Question $question)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Question $question)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Question $question)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question)
    {
        //
    }
}
