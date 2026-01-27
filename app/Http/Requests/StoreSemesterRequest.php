<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSemesterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^(Fall|Spring|Summer|Short) \d{2}$/',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->name)) {
            $normalized = trim(preg_replace('/\s+/', ' ', $this->name));
            $this->merge([
                'name' => ucfirst($normalized),
            ]);
        }
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.regex' => 'The semester name must be in the format: Fall 20, Spring 23, Summer 25, or Short 25. If you believe this is a valid semester name, please contact us via our contact page.',
        ];
    }
}
