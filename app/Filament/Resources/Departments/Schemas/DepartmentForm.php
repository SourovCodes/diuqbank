<?php

namespace App\Filament\Resources\Departments\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class DepartmentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Department Information')
                    ->description('Enter the department details')
                    ->icon('heroicon-o-building-office')
                    ->schema([
                        TextInput::make('name')
                            ->label('Department Name')
                            ->placeholder('e.g., Computer Science & Engineering')
                            ->maxLength(255)
                            ->required(),
                        TextInput::make('short_name')
                            ->label('Short Name / Abbreviation')
                            ->placeholder('e.g., CSE')
                            ->maxLength(10)
                            ->required(),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),
            ]);
    }
}
