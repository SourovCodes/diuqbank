<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserReportRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users'],
            'question_id' => ['required', 'exists:questions'],
            'type' => ['required'],
            'details' => ['required'],
            'reviewed' => ['boolean'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
