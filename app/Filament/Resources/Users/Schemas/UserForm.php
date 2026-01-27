<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Profile')
                    ->description('User profile information and avatar')
                    ->icon('heroicon-o-user-circle')
                    ->columns(2)
                    ->schema([
                        SpatieMediaLibraryFileUpload::make('avatar')
                            ->collection('avatar')
                            ->avatar()
                            ->imageEditor()
                            ->circleCropper()
                            ->columnSpanFull(),
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->prefixIcon('heroicon-o-user'),
                        TextInput::make('username')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255)
                            ->alphaDash()
                            ->prefixIcon('heroicon-o-at-symbol'),
                    ]),
                Section::make('Academic Information')
                    ->description('Student identification details')
                    ->icon('heroicon-o-academic-cap')
                    ->schema([
                        TextInput::make('student_id')
                            ->label('Student ID')
                            ->unique(ignoreRecord: true)
                            ->maxLength(255)
                            ->placeholder('e.g., 123-45-6789')
                            ->prefixIcon('heroicon-o-identification'),
                    ]),
                Section::make('Account')
                    ->description('Email and authentication settings')
                    ->icon('heroicon-o-envelope')
                    ->columns(2)
                    ->schema([
                        TextInput::make('email')
                            ->email()
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255)
                            ->prefixIcon('heroicon-o-envelope')
                            ->columnSpanFull(),
                        TextInput::make('password')
                            ->password()
                            ->revealable()
                            ->dehydrated(fn (?string $state): bool => filled($state))
                            ->required(fn (string $operation): bool => $operation === 'create')
                            ->minLength(8)
                            ->maxLength(255)
                            ->prefixIcon('heroicon-o-lock-closed'),
                        TextInput::make('password_confirmation')
                            ->password()
                            ->revealable()
                            ->requiredWith('password')
                            ->same('password')
                            ->dehydrated(false)
                            ->prefixIcon('heroicon-o-lock-closed'),
                    ]),
            ]);
    }
}
