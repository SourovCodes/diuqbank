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
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('flutter-app-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function socialLogin(Request $request)
    {
        $request->validate(['provider' => 'required', 'token' => 'required']);

        $provider = $request->provider;
        $socialUser = Socialite::driver($provider)->stateless()->userFromToken($request->token);

        $user = User::where('email', $socialUser->getEmail())->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $token = $user->createToken('flutter-app-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user]);
    }

}

