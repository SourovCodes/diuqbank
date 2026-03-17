<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Welcome back!',
        ]);

        return redirect()->intended(route('home'));
    }

    public function destroy(): RedirectResponse
    {
        Auth::logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'You have been logged out.',
        ]);

        return redirect()->route('home');
    }
}
