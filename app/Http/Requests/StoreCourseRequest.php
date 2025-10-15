<?php

namespace App\Http\Requests;

use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('courses', 'name')->where(fn (QueryBuilder $query) => $query->where('department_id', $this->integer('department_id'))),
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->department_id !== null) {
            $this->merge([
                'department_id' => (int) $this->department_id,
            ]);
        }

        if (is_string($this->name)) {
            $this->merge([
                'name' => trim(preg_replace('/\s+/', ' ', $this->name)),
            ]);
        }
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'A course with this name already exists for the selected department.',
        ];
    }
}
