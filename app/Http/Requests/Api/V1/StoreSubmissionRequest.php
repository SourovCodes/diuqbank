<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubmissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'semester_id' => ['required', 'integer', 'exists:semesters,id'],
            'exam_type_id' => ['required', 'integer', 'exists:exam_types,id'],
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:10240'], // 10MB max
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
            'department_id.required' => 'A department is required.',
            'department_id.exists' => 'The selected department does not exist.',
            'course_id.required' => 'A course is required.',
            'course_id.exists' => 'The selected course does not exist.',
            'semester_id.required' => 'A semester is required.',
            'semester_id.exists' => 'The selected semester does not exist.',
            'exam_type_id.required' => 'An exam type is required.',
            'exam_type_id.exists' => 'The selected exam type does not exist.',
            'pdf.required' => 'A PDF file is required.',
            'pdf.file' => 'The upload must be a valid file.',
            'pdf.mimes' => 'The file must be a PDF.',
            'pdf.max' => 'The PDF file must not exceed 10MB.',
        ];
    }
}
