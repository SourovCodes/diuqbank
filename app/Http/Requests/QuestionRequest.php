<?php

namespace App\Http\Requests;

use App\Rules\CourseBelongsToDepartment;
use App\Rules\ValidPdfKey;
use Illuminate\Foundation\Http\FormRequest;

class QuestionRequest extends FormRequest
{
    public function rules(): array
    {
        $rules = [
            'department_id' => ['required', 'numeric', 'exists:departments,id'],
            'course_id' => [
                'required',
                'numeric',
                'exists:courses,id',
                new CourseBelongsToDepartment($this->department_id),
            ],
            'semester_id' => ['required', 'numeric', 'exists:semesters,id'],
            'exam_type_id' => ['required', 'numeric', 'exists:exam_types,id'],
            'section' => [
                'nullable',
                'string',
                'max:5',
            ],
        ];


        if ($this->isMethod('POST')) {
            $rules['pdf_key'] = ['required', 'string', 'max:255', new ValidPdfKey];
        } else {
            $rules['pdf_key'] = ['nullable', 'string', 'max:255', new ValidPdfKey];
        }

        return $rules;
    }

    public function authorize(): bool
    {
        return true;
    }
}
