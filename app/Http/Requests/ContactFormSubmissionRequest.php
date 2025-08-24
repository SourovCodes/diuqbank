<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactFormSubmissionRequest extends FormRequest
{
    public function rules()
    {
        return [
            'name' => ['required'],
            'email_or_phone' => ['required'],
            'message' => ['required'],
        ];
    }

    public function authorize()
    {
        return true;
    }
}
