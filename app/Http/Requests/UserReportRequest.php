<?php

namespace App\Http\Requests;

use App\Enums\UserReportType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UserReportRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users'],
            'question_id' => ['required', 'exists:questions'],
            'type' => ['required', new Enum(UserReportType::class)],
            'details' => ['required'],
            'reviewed' => ['boolean'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
