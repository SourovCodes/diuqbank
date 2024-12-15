<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuestionResource;
use App\Models\CourseName;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filter = (object)[
            'semester' => $request->input('semester'),
            'course_name' => $request->input('course_name'),
            'department' => $request->input('department'),
            'exam_type' => $request->input('exam_type'),
            'qsearch' => $request->input('qsearch')
        ];

        return QuestionResource::collection(Question::with(['course_names', 'semesters', 'departments', 'exam_types', 'media', 'user'])
            ->filter($filter)->paginate(50));


    }

    public function formOptions()
    {

        return [
            [
                'label' => "Question File",
                'key' => "dep",
                'type' => 'file',
                'filetype' => ['application/pdf'],
                'temp_upload_endpoint' => route('home') . '/api/temp_upload'
            ],

            [
                'label' => "Departments",
                'key' => "dep",
                'type' => 'select',
                'options' => Department::all()->sortBy('name')->values(),
            ],
            [
                'label' => "Course Names",
                'key' => "course",
                'type' => 'multiselect',
                'options' => CourseName::all()->sortBy('name')->values(),
            ],
            [
                'label' => "Semesters",
                'key' => "sem",
                'type' => 'multiselect',
                'options' => Semester::all()->sortBy('name')->values(),
            ],
            [
                'label' => "Exam Types",
                'key' => "exm",
                'type' => 'multiselect',
                'options' => ExamType::all()->sortBy('name')->values(),
            ]
        ];

    }

    public function getFilterOptions()
    {
        return [
            'course_name' => CourseName::all()->sortBy('name')->values(),
            'department' => Department::all(),
            'semester' => Semester::all(),
            'exam_type' => ExamType::all(),
            'empty' => [],
//            'user'=>User::all(),
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
