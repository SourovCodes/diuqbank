<?php

namespace App\Http\Controllers\API;

use App\Enums\UserRole;
use App\Events\NewUserRegistered;
use App\Http\Controllers\Controller;
use App\Models\User;
use Filament\Notifications\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->userFromToken($request->token);

            $user = User::withTrashed()->where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Generate a unique username
                $username = Str::slug($googleUser->getName());
                $i = 1;
                while (User::where('username', $username)->exists()) {
                    $username = Str::slug($googleUser->getName()) . $i++;
                }

                // Create a new user
                $newUser = User::create([
                    'name' => $googleUser->getName(),
                    'username' => $username,
                    'email' => $googleUser->getEmail(),
                    'role' => $googleUser->getEmail() === 'sourovbuzz@gmail.com' ? UserRole::admin : UserRole::user,
                ]);

                if (!empty($googleUser['verified_email'])) {
                    $newUser->markEmailAsVerified();
                }

                // Add profile image from Google avatar
                $newUser->addMediaFromUrl(str_replace('=s96-c', '', $googleUser->avatar))
                    ->usingFileName($googleUser->getName() . '.png')
                    ->toMediaCollection('profile-images', 'profile-images');

                // Trigger registration event
                event(new NewUserRegistered($newUser));

                $token = $newUser->createToken('authToken')->plainTextToken;

                return response()->json([
                    'success' => true,
                    'token' => $token,
                    'user' => $newUser,
                ]);
            }

            // Restore user if soft deleted
            if ($user->trashed()) {
                $user->restore();
            }

            if (!empty($googleUser['verified_email'])) {
                $user->markEmailAsVerified();
            }

            // Generate token for existing user
            $token = $user->createToken('authToken')->plainTextToken;

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => $user,
            ]);
        } catch (\Throwable $th) {
            // Log the error for debugging
            Log::error('Google login error: ' . $th->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Google login failed. Please try again.',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

}

