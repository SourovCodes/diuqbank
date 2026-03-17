<?php

namespace App\Http\Requests;

use App\Models\ExamType;
use Illuminate\Foundation\Http\FormRequest;

class StoreSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $examTypeRequiresSection = false;
        if ($this->filled('exam_type_id')) {
            $examType = ExamType::find($this->input('exam_type_id'));
            $examTypeRequiresSection = $examType?->requires_section ?? false;
        }

        return [
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'semester_id' => ['required', 'integer', 'exists:semesters,id'],
            'exam_type_id' => ['required', 'integer', 'exists:exam_types,id'],
            'section' => $examTypeRequiresSection ? ['required', 'string', 'max:255'] : ['nullable', 'string', 'max:255'],
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:10240'],
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
            'section.required' => 'Section is required for this exam type.',
            'pdf.required' => 'Please upload a PDF file.',
            'pdf.mimes' => 'The file must be a PDF.',
            'pdf.max' => 'The PDF file must not exceed 10MB.',
        ];
    }
}
