<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Course;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateSubmissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only the owner can update their submission
        return $this->user() !== null && $this->route('submission')->user_id === $this->user()->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'department_id' => ['sometimes', 'required', 'exists:departments,id'],
            'course_id' => ['sometimes', 'required', 'exists:courses,id'],
            'semester_id' => ['sometimes', 'required', 'exists:semesters,id'],
            'exam_type_id' => ['sometimes', 'required', 'exists:exam_types,id'],
            'pdf' => ['sometimes', 'required', 'file', 'mimes:pdf', 'max:10240'], // 10MB max
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if (! $this->hasAny(['department_id', 'course_id', 'semester_id', 'exam_type_id', 'pdf'])) {
                    $validator->errors()->add('pdf', 'At least one field must be provided for update.');
                }

                $this->validateCourseBelongsToDepartment($validator);
            },
        ];
    }

    /**
     * Validate that the course belongs to the selected department.
     */
    protected function validateCourseBelongsToDepartment(Validator $validator): void
    {
        $submission = $this->route('submission');
        $departmentId = $this->input('department_id', $submission->question->department_id);
        $courseId = $this->input('course_id', $submission->question->course_id);

        // Only validate if either field is being updated
        if (! $this->hasAny(['department_id', 'course_id'])) {
            return;
        }

        $course = Course::find($courseId);

        if ($course && $course->department_id !== (int) $departmentId) {
            $validator->errors()->add(
                'course_id',
                'The selected course does not belong to the selected department.'
            );
        }
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'department_id.required' => 'The department is required.',
            'department_id.exists' => 'The selected department does not exist.',
            'course_id.required' => 'The course is required.',
            'course_id.exists' => 'The selected course does not exist.',
            'semester_id.required' => 'The semester is required.',
            'semester_id.exists' => 'The selected semester does not exist.',
            'exam_type_id.required' => 'The exam type is required.',
            'exam_type_id.exists' => 'The selected exam type does not exist.',
            'pdf.required' => 'A PDF file is required.',
            'pdf.file' => 'The upload must be a valid file.',
            'pdf.mimes' => 'The file must be a PDF.',
            'pdf.max' => 'The PDF file must not exceed 10MB.',
        ];
    }
}
