<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationController extends Controller
{
    public function notice(): Response|RedirectResponse
    {
        if (request()->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard.index'));
        }

        return Inertia::render('auth/verify-email');
    }

    public function verify(EmailVerificationRequest $request): RedirectResponse
    {
        $request->fulfill();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Email verified successfully!',
        ]);

        return redirect()->intended(route('dashboard.index'));
    }

    public function send(): RedirectResponse
    {
        if (request()->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard.index'));
        }

        request()->user()->sendEmailVerificationNotification();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Verification link sent!',
        ]);

        return back();
    }
}
