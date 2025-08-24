<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CourseRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'department_id' => ['required', 'numeric', 'exists:departments,id'],
            'name' => ['required', 'string', 'max:255', 'unique:courses,name,'.$this->route('course').',id,department_id,'.$this->department_id],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
