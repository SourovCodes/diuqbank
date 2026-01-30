<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Validate email domain
            $email = $googleUser->getEmail();
            if (! $this->isValidDiuEmail($email)) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'Only DIU email addresses (@diu.edu.bd or @s.diu.edu.bd) are allowed.',
                ]);

                return redirect()->route('login');
            }

            // Find user by email
            $user = User::query()->where('email', $email)->first();

            if ($user) {
                // Mark email as verified since Google has verified it
                if (! $user->hasVerifiedEmail()) {
                    $user->markEmailAsVerified();
                }

                // Update existing user's avatar from Google if they don't have one
                if (! $user->hasMedia('avatar') && $googleUser->getAvatar()) {
                    try {
                        $avatarUrl = $this->getFullSizeAvatarUrl($googleUser->getAvatar());
                        $user->addMediaFromUrl($avatarUrl)
                            ->toMediaCollection('avatar');
                    } catch (\Exception $e) {
                        // Silently fail if avatar download fails
                    }
                }
            } else {
                // Generate username from email
                $username = $this->generateUsername($googleUser->getEmail());

                // Create new user
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'username' => $username,
                    'email_verified_at' => now(),
                    'password' => Hash::make(Str::random(32)), // Random password for OAuth users
                ]);
                $user->markEmailAsVerified();
                // Add avatar from Google
                if ($googleUser->getAvatar()) {
                    try {
                        $avatarUrl = $this->getFullSizeAvatarUrl($googleUser->getAvatar());
                        $user->addMediaFromUrl($avatarUrl)
                            ->toMediaCollection('avatar');
                    } catch (\Exception $e) {
                        // Silently fail if avatar download fails
                    }
                }
            }

            Auth::login($user, remember: true);

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Successfully logged in with Google!',
            ]);

            return redirect()->intended(route('home'));
        } catch (\Exception $e) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Failed to authenticate with Google. Please try again.',
            ]);

            return redirect()->route('login');
        }
    }

    private function generateUsername(string $email): string
    {
        $baseUsername = Str::before($email, '@');
        // Remove special characters and keep only alphanumeric
        $baseUsername = preg_replace('/[^a-zA-Z0-9]/', '', $baseUsername);
        $baseUsername = Str::lower($baseUsername);
        $username = $baseUsername;
        $counter = 1;

        while (User::query()->where('username', $username)->exists()) {
            $username = $baseUsername.'_'.$counter;
            $counter++;
        }

        return $username;
    }

    private function isValidDiuEmail(string $email): bool
    {
        return preg_match('/^[a-zA-Z0-9._%+-]+@(diu\.edu\.bd|s\.diu\.edu\.bd)$/', $email) === 1;
    }

    private function getFullSizeAvatarUrl(string $url): string
    {
        // Google avatar URLs end with "=s96-c" or similar size params
        // Remove everything from the last "=s" to get the full size image
        $lastEqualS = strrpos($url, '=s');

        if ($lastEqualS !== false) {
            return substr($url, 0, $lastEqualS);
        }

        return $url;
    }
}
