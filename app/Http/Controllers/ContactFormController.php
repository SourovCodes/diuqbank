<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactFormRequest;
use App\Models\ContactFormSubmission as ContactFormSubmissionModel;
use Illuminate\Http\RedirectResponse;

class ContactFormController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(ContactFormRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Store the submission in database
        ContactFormSubmissionModel::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'message' => $data['message'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('contact')->with('success', 'Message sent successfully.');
    }
}
