<?php

namespace App\Filament\Resources\ContactFormSubmissions\Pages;

use App\Filament\Resources\ContactFormSubmissions\ContactFormSubmissionResource;
use Filament\Resources\Pages\CreateRecord;

class CreateContactFormSubmission extends CreateRecord
{
    protected static string $resource = ContactFormSubmissionResource::class;
}
