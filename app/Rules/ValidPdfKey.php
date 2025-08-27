<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Auth;

class ValidPdfKey implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Check if the value matches the expected pattern
        if (! preg_match('/^temp-uploads\/(\d+)\/[a-f0-9\-]+\.pdf$/', $value, $matches)) {
            $fail('The :attribute must be in the format: temp-uploads/{user_id}/{uuid}.pdf');

            return;
        }

        // Extract user ID from the path
        $userIdInPath = (int) $matches[1];

        // Get the authenticated user's ID
        $authenticatedUserId = Auth::id();

        // Check if the user ID in the path matches the authenticated user
        if ($userIdInPath !== $authenticatedUserId) {
            $fail('The :attribute must contain the authenticated user\'s ID in the path.');
        }
    }
}
