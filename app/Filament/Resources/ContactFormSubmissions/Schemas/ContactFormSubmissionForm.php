<?php

namespace App\Filament\Resources\ContactFormSubmissions\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class ContactFormSubmissionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('email_or_phone')
                    ->email()
                    ->tel()
                    ->required(),
                TextInput::make('message')
                    ->required(),
            ]);
    }
}
