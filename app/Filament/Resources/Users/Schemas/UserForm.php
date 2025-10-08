<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Profile')
                    ->columns(3)
                    ->columnSpanFull()
                    ->schema([
                        SpatieMediaLibraryFileUpload::make('profile_picture')
                            ->collection('profile_picture')
                            ->label('Profile picture')
                            ->disk('public')
                            ->image()
                            ->imageEditor()
                            ->columnSpan(1),
                        Grid::make(2)
                            ->columnSpan(2)
                            ->schema([
                                TextInput::make('name')
                                    ->required()
                                    ->maxLength(255),
                                TextInput::make('email')
                                    ->label('Email address')
                                    ->email()
                                    ->required()
                                    ->unique()
                                    ->maxLength(255),
                                TextInput::make('username')
                                    ->required()
                                    ->unique()
                                    ->maxLength(255),
                                TextInput::make('student_id')
                                    ->label('Student ID')
                                    ->maxLength(255),
                            ]),
                    ]),
                Section::make('Security')
                    ->columns(2)
                    ->columnSpanFull()
                    ->schema([
                        TextInput::make('password')
                            ->password()
                            ->revealable()
                            ->dehydrated(fn (?string $state): bool => filled($state))
                            ->required(fn (string $operation): bool => $operation === 'create')
                            ->helperText(fn (string $operation): ?string => $operation === 'edit'
                                ? 'Leave blank to keep the existing password.'
                                : null)
                            ->maxLength(255),
                        TextInput::make('password_confirmation')
                            ->label('Confirm password')
                            ->password()
                            ->revealable()
                            ->same('password')
                            ->required(fn (string $operation): bool => $operation === 'create')
                            ->dehydrated(false),
                        DateTimePicker::make('email_verified_at')
                            ->label('Email verified at')
                            ->seconds(false)
                            ->nullable()
                            ->native(false),
                    ]),
            ]);
    }
}
