<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactFormSubmissionRequest;
use App\Models\ContactFormSubmission;

class ContactFormSubmissionsController extends Controller
{
    /**
     * Store a newly created contact form submission in storage.
     */
    public function store(StoreContactFormSubmissionRequest $request)
    {
        ContactFormSubmission::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'message' => $request->validated('message'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Thank you for contacting us! We will get back to you soon.',
        ], 201);
    }
}
