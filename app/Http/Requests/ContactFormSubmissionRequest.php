<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactFormSubmissionRequest extends FormRequest
{
    public function rules()
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email_or_phone' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }

    public function authorize()
    {
        return true;
    }
}
