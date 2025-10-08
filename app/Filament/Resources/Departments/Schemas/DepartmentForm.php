<?php

namespace App\Filament\Resources\Departments\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class DepartmentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Department details')
                    ->columns(2)
                    ->columnSpanFull()
                    ->schema([
                        TextInput::make('name')
                            ->label('Department name')
                            ->required()
                            ->maxLength(255)
                            ->unique()
                            ->placeholder('Computer Science and Engineering'),
                        TextInput::make('short_name')
                            ->label('Short code')
                            ->required()
                            ->maxLength(10)
                            ->minLength(2)
                            ->unique()
                            ->regex('/^[A-Za-z0-9&.-]+$/')
                            ->helperText('Use uppercase letters, numbers, or . - & (e.g., CSE).')
                            ->live(onBlur: true)
                            ->formatStateUsing(fn (?string $state): ?string => filled($state) ? Str::upper($state) : null)
                            ->dehydrateStateUsing(fn (?string $state): ?string => filled($state) ? Str::upper($state) : null)
                            ->validationAttribute('short code')
                            ->placeholder('CSE'),
                    ]),
            ]);
    }
}
