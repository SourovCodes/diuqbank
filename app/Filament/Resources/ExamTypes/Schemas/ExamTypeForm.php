<?php

namespace App\Filament\Resources\ExamTypes\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ExamTypeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->unique()
                    ->maxLength(255)
                    ->required(),
                Toggle::make('requires_section')
                    ->required(),
            ]);
    }
}
