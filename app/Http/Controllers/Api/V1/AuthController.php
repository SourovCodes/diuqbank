<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Requests\Api\V1\Auth\UpdateProfileRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'username' => $request->validated('username'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
        ]);

        event(new Registered($user));

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login a user and return a token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
                'errors' => [
                    'email' => ['The provided credentials are incorrect.'],
                ],
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout the authenticated user.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(null, 204);
    }

    /**
     * Get the authenticated user.
     */
    public function user(Request $request): JsonResponse
    {
        return (new UserResource($request->user()))->response();
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $request->user()->update($request->validated());
        $request->user()->refresh();

        return (new UserResource($request->user()))->response();
    }

    /**
     * Send a new email verification notification.
     */
    public function sendVerificationEmail(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return (new UserResource($request->user()))->response();
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(null, 204);
    }

    /**
     * Mark the authenticated user's email address as verified.
     */
    public function verifyEmail(Request $request, string $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return response()->json([
                'message' => 'Invalid verification link.',
                'errors' => [
                    'hash' => ['The verification link is invalid or has expired.'],
                ],
            ], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return (new UserResource($user))->response();
        }

        $user->markEmailAsVerified();

        event(new Verified($user));

        return (new UserResource($user))->response();
    }
}
