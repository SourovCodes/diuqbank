<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SemesterRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            // Allowed format examples: "Fall 23", "Spring 24", "Summer 25", "Short 24".
            'name' => [
                'required',
                'string',
                'regex:/^(Spring|Summer|Fall|Short)\s\d{2}$/',
                Rule::unique('semesters', 'name')->ignore($this->route('semester')),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.regex' => 'The name must be in the format: Spring 23, Summer 24, Fall 24, Short 24, etc.',
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
