<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreSemesterRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:semesters,name',
                'regex:/^(Fall|Spring|Summer|Short) \d{2}$/',
            ],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if (is_string($this->name)) {
            // Normalize whitespace
            $normalized = trim(preg_replace('/\s+/', ' ', $this->name));

            // Split into parts and capitalize first word (Fall, Spring, Summer, Short)
            $parts = explode(' ', $normalized);
            if (count($parts) === 2) {
                $parts[0] = ucfirst(strtolower($parts[0]));
                $normalized = implode(' ', $parts);
            }

            $this->merge([
                'name' => $normalized,
            ]);
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
            'name.unique' => 'This semester already exists.',
            'name.regex' => 'The semester name must be in the format: Fall 20, Spring 23, Summer 25, or Short 25. If you believe this is a valid semester name, please contact us via our contact page.',
        ];
    }
}
