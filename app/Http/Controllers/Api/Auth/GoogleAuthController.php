<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth page.
     */
    public function redirect(Request $request): JsonResponse
    {
        $callbackUrl = $request->input('callback_url');

        $socialite = Socialite::driver('google')->stateless();

        if ($callbackUrl) {
            $socialite->redirectUrl($callbackUrl);
        }

        $url = $socialite->redirect()->getTargetUrl();

        return response()->json([
            'url' => $url,
        ]);
    }

    /**
     * Handle Google OAuth callback and return API token.
     */
    public function callback(): JsonResponse
    {
        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Authentication failed. Please try again.',
                'error' => $e->getMessage(),
            ], 401);
        }

        // Check if email domain is allowed
        $allowedDomains = ['@diu.edu.bd', '@s.diu.edu.bd'];
        $userEmail = $googleUser->email;
        $isAllowedDomain = false;

        foreach ($allowedDomains as $domain) {
            if (Str::endsWith($userEmail, $domain)) {
                $isAllowedDomain = true;
                break;
            }
        }

        if (! $isAllowedDomain) {
            return response()->json([
                'message' => 'Only DIU email addresses (@diu.edu.bd or @s.diu.edu.bd) are allowed to register.',
            ], 403);
        }

        $user = User::query()
            ->where('email', $googleUser->email)
            ->first();

        if (! $user) {
            $user = User::query()->create([
                'name' => $googleUser->name,
                'email' => $googleUser->email,
                'username' => $this->generateUniqueUsername($googleUser->email),
                'email_verified_at' => now(),
                'password' => bcrypt(Str::random(32)),
            ]);
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        // Create Sanctum token for API authentication
        $token = $user->createToken('spa-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    private function generateUniqueUsername(string $email): string
    {
        $baseUsername = Str::before($email, '@');
        $baseUsername = Str::slug($baseUsername, separator: '');
        $username = $baseUsername;
        $counter = 1;

        while (User::query()->where('username', $username)->exists()) {
            $username = $baseUsername.$counter;
            $counter++;
        }

        return $username;
    }
}
