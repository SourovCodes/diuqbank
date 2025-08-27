<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactFormSubmissionRequest;
use App\Models\ContactFormSubmission;

class ContactController extends Controller
{
    public function index()
    {
        return view('contact');
    }

    public function store(ContactFormSubmissionRequest $request)
    {
        try {
            ContactFormSubmission::create($request->validated());

            toast('Message sent successfully! We\'ll get back to you soon.', 'success');

            return redirect()->back();
        } catch (\Exception $e) {
            toast('An error occurred while sending your message. Please try again.', 'error');

            return redirect()->back()->withInput();
        }
    }
}
