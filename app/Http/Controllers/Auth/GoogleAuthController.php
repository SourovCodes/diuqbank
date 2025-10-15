<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

class GoogleAuthController extends Controller
{
    public function redirect(): SymfonyRedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();

        // Check if email domain is allowed
        $allowedDomains = ['@diu.edu.bd', '@s.diu.edu.bd'];
        $userEmail = $googleUser->getEmail();
        $isAllowedDomain = false;

        foreach ($allowedDomains as $domain) {
            if (Str::endsWith($userEmail, $domain)) {
                $isAllowedDomain = true;
                break;
            }
        }

        if (! $isAllowedDomain) {
            return redirect()->route('login')->with(
                'error' ,'Only DIU email addresses (@diu.edu.bd or @s.diu.edu.bd) are allowed to register.',
            );
        }

        $user = User::query()
            ->where('email', $googleUser->getEmail())
            ->first();

        if (! $user) {
            $user = User::query()->create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'username' => $this->generateUniqueUsername($googleUser->getEmail()),
                'email_verified_at' => now(),
                'password' => bcrypt(Str::random(32)),
            ]);
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        Auth::login($user, remember: true);

        return redirect()->intended(route('home'));
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
