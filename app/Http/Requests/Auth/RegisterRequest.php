<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:'.User::class],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:'.User::class,
                'regex:/^[a-zA-Z0-9._%+-]+@(diu\.edu\.bd|s\.diu\.edu\.bd)$/',
            ],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.regex' => 'Only DIU email addresses (@diu.edu.bd or @s.diu.edu.bd) are allowed.',
        ];
    }
}
