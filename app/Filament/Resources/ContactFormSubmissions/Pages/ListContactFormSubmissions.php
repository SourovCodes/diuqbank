<?php

namespace App\Filament\Resources\ContactFormSubmissions\Pages;

use App\Filament\Resources\ContactFormSubmissions\ContactFormSubmissionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListContactFormSubmissions extends ListRecords
{
    protected static string $resource = ContactFormSubmissionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
