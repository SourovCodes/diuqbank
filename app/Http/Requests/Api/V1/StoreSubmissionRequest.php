<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Course;
use App\Models\Question;
use App\Models\Submission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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
     * Configure the validator instance.
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $this->validateCourseBelongsToDepartment($validator);
                $this->validateNoDuplicateSubmission($validator);
            },
        ];
    }

    /**
     * Validate that the course belongs to the selected department.
     */
    protected function validateCourseBelongsToDepartment(Validator $validator): void
    {
        if ($validator->errors()->hasAny(['department_id', 'course_id'])) {
            return;
        }

        $course = Course::find($this->input('course_id'));

        if ($course && $course->department_id !== (int) $this->input('department_id')) {
            $validator->errors()->add(
                'course_id',
                'The selected course does not belong to the selected department.'
            );
        }
    }

    /**
     * Validate that the user hasn't already submitted for this question.
     */
    protected function validateNoDuplicateSubmission(Validator $validator): void
    {
        if ($validator->errors()->hasAny(['department_id', 'course_id', 'semester_id', 'exam_type_id'])) {
            return;
        }

        $question = Question::query()
            ->where('department_id', $this->input('department_id'))
            ->where('course_id', $this->input('course_id'))
            ->where('semester_id', $this->input('semester_id'))
            ->where('exam_type_id', $this->input('exam_type_id'))
            ->first();

        if (! $question) {
            return;
        }

        $existingSubmission = Submission::query()
            ->where('question_id', $question->id)
            ->where('user_id', $this->user()->id)
            ->exists();

        if ($existingSubmission) {
            $validator->errors()->add(
                'question',
                'You have already submitted a PDF for this question. Please update your existing submission instead.'
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
