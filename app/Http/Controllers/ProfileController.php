<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileImageRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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

        $validated = $request->validated();

        // Remove old avatar if exists
        $user->clearMediaCollection('profile_picture');

        // Decode base64 image
        $imageData = $validated['avatar'];

        // Remove data:image/...;base64, part if exists
        if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $matches)) {
            $imageData = substr($imageData, strpos($imageData, ',') + 1);
            $extension = $matches[1];
        } else {
            $extension = 'jpg';
        }

        $imageData = base64_decode($imageData);

        // Generate unique filename
        $filename = 'avatar_'.$user->id.'_'.time().'.'.$extension;

        // Store in temp location first
        $tempPath = 'temp/'.$filename;
        Storage::disk('local')->put($tempPath, $imageData);

        // Add to media library
        $user->addMedia(Storage::disk('local')->path($tempPath))
            ->toMediaCollection('profile_picture');

        // Clean up temp file
        Storage::disk('local')->delete($tempPath);

        // Clear the cached avatar URL
        cache()->forget("user.{$user->id}.avatar");

        return redirect()->back();
    }
}
