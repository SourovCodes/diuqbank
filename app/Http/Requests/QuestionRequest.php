<?php

namespace App\Http\Requests;

use App\Rules\CourseBelongsToDepartment;
use App\Rules\ValidPdfKey;
use Illuminate\Foundation\Http\FormRequest;
use App\Models\ExamType;

class QuestionRequest extends FormRequest
{
    // Ensure 'section' is nulled when the chosen exam type doesn't require it
    protected function prepareForValidation(): void
    {
        $examTypeId = $this->input('exam_type_id');
        if ($examTypeId) {
            $examType = ExamType::find($examTypeId);
            if ($examType && !$examType->requires_section) {
                $this->merge(['section' => null]);
            }
        }
    }

    public function rules(): array
    {
        // Determine if the selected exam type requires a section
        $requiresSection = false;
        if ($this->exam_type_id) {
            $examType = ExamType::find($this->exam_type_id);
            $requiresSection = (bool) optional($examType)->requires_section;
        }

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
                $requiresSection ? 'required' : 'nullable',
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
