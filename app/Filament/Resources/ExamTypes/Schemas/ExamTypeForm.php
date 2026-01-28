<?php

namespace App\Filament\Resources\ExamTypes\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ExamTypeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Exam Type Information')
                    ->description('Enter the exam type details (e.g., Midterm, Final, Quiz)')
                    ->icon('heroicon-o-clipboard-document-list')
                    ->schema([
                        TextInput::make('name')
                            ->label('Exam Type Name')
                            ->placeholder('e.g., Midterm Examination')
                            ->required()
                            ->maxLength(255),
                        Toggle::make('requires_section')
                            ->label('Requires Section')
                            ->helperText('Enable if submissions for this exam type require a section identifier')
                            ->default(false),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
