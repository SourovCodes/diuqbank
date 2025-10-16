<?php

namespace App\Filament\Resources\ContactFormSubmissions\Pages;

use App\Filament\Resources\ContactFormSubmissions\ContactFormSubmissionResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditContactFormSubmission extends EditRecord
{
    protected static string $resource = ContactFormSubmissionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
