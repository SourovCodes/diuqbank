<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleLoginController extends Controller
{
    public function redirect(Request $request)
    {
        if($request->wantsJson()){
            return response()->json([
                'url' => Socialite::driver('google')->redirect()->getTargetUrl(),
            ]);
        }
        return Socialite::driver('google')->redirect();

    }

    public function googleCallback(Request $request)
    {

        try {
            $googleUser = Socialite::driver('google')->user();
            $email = strtolower($googleUser->getEmail());
            $allowed = str_ends_with($email, '@diu.edu.bd') || str_ends_with($email, '@s.diu.edu.bd');
            if (! $allowed) {
                return redirect()->route('login')->with('error', 'Only DIU email addresses are allowed (diu.edu.bd or s.diu.edu.bd).');
            }

            $user = User::where('email', $googleUser->getEmail())->first();
            if (! $user) {

                $username = strstr($googleUser->getEmail(), '@', true);
                $new_user = User::create([
                    'name' => $googleUser->getName(),
                    'username' => $username,
                    'email' => $googleUser->getEmail(),
                ]);

                Auth::login($new_user);

                if ($googleUser['verified_email']) {
                    $new_user->markEmailAsVerified();
                }

                if ($request->wantsJson()) {
                    return response()->json([
                        'message' => 'User created and logged in successfully.',
                        'user' => $new_user,
                    ]);
                }

                return redirect()->intended(route('home'));
            } else {

                Auth::login($user);
                if ($googleUser['verified_email']) {
                    $user->markEmailAsVerified();
                }
                if ($request->wantsJson()) {
                    return response()->json([
                        'message' => 'User logged in successfully.',
                        'user' => $user,
                    ]);
                }

                return redirect()->intended(route('home'));
            }
        } catch (\Throwable $th) {

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Google login failed. Please try again.',
                    'error' => $th->getMessage(),
                ], 500);
            }

            return redirect()->intended(route('home'));

        }
    }
}
