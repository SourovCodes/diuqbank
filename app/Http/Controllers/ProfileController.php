<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileImageRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the profile edit form.
     */
    public function edit(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        return Inertia::render('profile/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'student_id' => $user->student_id,
                'avatar' => $user->getFirstMediaUrl('profile_picture'),
            ],
        ]);
    }

    /**
     * Update the user's profile.
     */
    public function update(UpdateProfileRequest $request): \Illuminate\Http\RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validated();

        // Update basic profile information
        $user->update([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'student_id' => $validated['student_id'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Profile updated successfully!');
    }

    /**
     * Update the user's profile picture.
     */
    public function updateImage(UpdateProfileImageRequest $request): \Illuminate\Http\RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        // Remove old avatar if exists
        $user->clearMediaCollection('profile_picture');

        // Add new avatar directly from request
        $user->addMediaFromRequest('avatar')
            ->toMediaCollection('profile_picture');

        // Clear the cached avatar URL
        cache()->forget("user.{$user->id}.avatar");

        return redirect()->back();
    }
}
