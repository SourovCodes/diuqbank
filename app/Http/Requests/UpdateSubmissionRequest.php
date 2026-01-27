<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->id === $this->route('submission')?->user_id;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'semester_id' => ['required', 'integer', 'exists:semesters,id'],
            'exam_type_id' => ['required', 'integer', 'exists:exam_types,id'],
            'pdf' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'department_id.required' => 'Please select a department.',
            'course_id.required' => 'Please select a course.',
            'semester_id.required' => 'Please select a semester.',
            'exam_type_id.required' => 'Please select an exam type.',
            'pdf.mimes' => 'The file must be a PDF.',
            'pdf.max' => 'The PDF file must not exceed 10MB.',
        ];
    }
}
