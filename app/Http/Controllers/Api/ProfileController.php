<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileImageRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\SessionUserResource;
use App\Models\User;

class ProfileController extends Controller
{
    /**
     * Update the user's profile.
     */
    public function update(UpdateProfileRequest $request)
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validated();

        // Update basic profile information
        $user->update([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'student_id' => $validated['student_id'] ?? null,
        ]);

        return (new SessionUserResource($user))
            ->additional([
                'message' => 'Profile updated successfully!',
            ]);
    }

    /**
     * Update the user's profile picture.
     */
    public function updateImage(UpdateProfileImageRequest $request)
    {
        /** @var User $user */
        $user = $request->user();

        // Remove old avatar if exists
        $user->clearMediaCollection('profile_picture');

        // Add new avatar directly from request
        $user->addMediaFromRequest('avatar')
            ->toMediaCollection('profile_picture');

        // Clear the cached avatar URL
        cache()->forget("user.{$user->id}.avatar");

        return (new SessionUserResource($user->fresh()))
            ->additional([
                'message' => 'Profile picture updated successfully!',
            ]);
    }
}
