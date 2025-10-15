<?php

namespace App\Filament\Resources\ExamTypes\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class ExamTypeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Exam type details')
                    ->columns(2)
                    ->columnSpanFull()
                    ->schema([
                        TextInput::make('name')
                            ->label('Exam type name')
                            ->required()
                            ->maxLength(100)
                            ->unique(ignoreRecord: true)
                            ->placeholder('Midterm')
                            ->live(onBlur: true)
                            ->dehydrateStateUsing(fn (?string $state): ?string => filled($state) ? Str::headline(str($state)->squish()->toString()) : null)
                            ->formatStateUsing(fn (?string $state): ?string => filled($state) ? Str::headline(str($state)->squish()->toString()) : null),
                        Toggle::make('requires_section')
                            ->label('Requires section input')
                            ->helperText('Enable when question numbers or sections are mandatory for this exam type.')
                            ->default(false)
                            ->inline(false),
                    ]),
            ]);
    }
}
