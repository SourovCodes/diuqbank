<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactFormRequest;
use App\Mail\ContactFormSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;

class ContactFormController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(ContactFormRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Mail::to('sourov2305101004@diu.edu.bd')->send(
            new ContactFormSubmission($data['name'], $data['email'], $data['message'])
        );

        return redirect()->route('contact')->with('success', 'Message sent successfully.');
    }
}
