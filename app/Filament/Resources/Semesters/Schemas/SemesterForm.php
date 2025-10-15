<?php

namespace App\Filament\Resources\Semesters\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class SemesterForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Semester details')
                    ->columns(2)
                    ->columnSpanFull()
                    ->schema([
                        TextInput::make('name')
                            ->label('Semester name')
                            ->required()
                            ->minLength(3)
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->helperText('Use the season and year, e.g., Spring 2025.')
                            ->placeholder('Fall 23'),
                    ]),
            ]);
    }
}
