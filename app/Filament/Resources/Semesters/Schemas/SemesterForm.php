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
                Section::make('Semester Information')
                    ->description('Enter the semester details (e.g., Spring 2024, Fall 2025)')
                    ->icon('heroicon-o-calendar')
                    ->schema([
                        TextInput::make('name')
                            ->label('Semester Name')
                            ->placeholder('e.g., Spring 2024')
                            ->required()
                            ->maxLength(255),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
