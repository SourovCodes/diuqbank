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
            $user = User::where('email', $googleUser->getEmail())->withTrashed()->first();
            if (!$user) {

                $i = 0;
                $username = Str::slug($googleUser->getName());
                while (User::where('username', '=', $username)->exists()) {
                    $i++;
                    $username = $username . $i;
                }
                $new_user = User::create([
                    'name' => $googleUser->getName(),
                    'username' => $username,
                    'email' => $googleUser->getEmail(),
                    'role' => $googleUser->getEmail() == 'sourovbuzz@gmail.com' ? UserRole::admin : UserRole::user,
                ]);
                if ($googleUser['verified_email']) {
                    $new_user->markEmailAsVerified();
                }
                event(new NewUserRegistered($new_user));
                $new_user->addMediaFromUrl(str_replace('=s96-c', '', $googleUser->avatar))
                    ->usingFileName($googleUser->name . '.png')
                    ->toMediaCollection('profile-images', 'profile-images');
                $token = $new_user->createToken('authToken')->plainTextToken;

                return response()->json(['token' => $token, 'user' => $new_user]);

            } else {
                if ($user->deleted_at) {
                    $user->restore();
                }
                if ($googleUser['verified_email']) {
                    $user->markEmailAsVerified();
                }
                // Generate a token for the user
                $token = $user->createToken('authToken')->plainTextToken;

                return response()->json(['token' => $token, 'user' => $user]);
            }
        } catch (\Throwable $th) {

            return response()->json(['error' => $th->getMessage()]);

        }


    }
}

