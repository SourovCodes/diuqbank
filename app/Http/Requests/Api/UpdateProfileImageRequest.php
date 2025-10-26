<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileImageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'avatar' => ['required', 'image', 'max:2048', 'mimes:jpeg,png,jpg,gif,webp'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'avatar.required' => 'Profile picture is required.',
            'avatar.image' => 'The file must be an image.',
            'avatar.max' => 'Profile picture must not exceed 2MB.',
            'avatar.mimes' => 'Profile picture must be a JPEG, PNG, JPG, GIF, or WebP image.',
        ];
    }
}
