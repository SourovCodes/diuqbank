<?php

namespace App\Http\Requests;

use App\Models\ExamType;
use App\Models\Question;
use App\Rules\CourseBelongsToDepartment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateQuestionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $question = $this->route('question');

        return Auth::check() && $question instanceof Question && Auth::id() === $question->user_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'department_id' => ['required', 'integer', Rule::exists('departments', 'id')],
            'course_id' => [
                'required',
                'integer',
                Rule::exists('courses', 'id'),
                new CourseBelongsToDepartment($this->input('department_id')),
            ],
            'semester_id' => ['required', 'integer', Rule::exists('semesters', 'id')],
            'exam_type_id' => ['required', 'integer', Rule::exists('exam_types', 'id')],
            'section' => [
                Rule::requiredIf(function () {
                    $examTypeId = $this->input('exam_type_id');
                    if (! $examTypeId) {
                        return false;
                    }

                    $examType = ExamType::find($examTypeId);

                    return $examType && $examType->requires_section;
                }),
                'nullable',
                'string',
                'max:255',
            ],
            'pdf' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'department_id.required' => 'Please select a department.',
            'department_id.exists' => 'The selected department is invalid.',
            'course_id.required' => 'Please select a course.',
            'course_id.exists' => 'The selected course is invalid.',
            'semester_id.required' => 'Please select a semester.',
            'semester_id.exists' => 'The selected semester is invalid.',
            'exam_type_id.required' => 'Please select an exam type.',
            'exam_type_id.exists' => 'The selected exam type is invalid.',
            'section.required' => 'Section is required for this exam type.',
            'pdf.mimes' => 'The file must be a PDF.',
            'pdf.max' => 'The PDF file must not exceed 10MB.',
        ];
    }
}
