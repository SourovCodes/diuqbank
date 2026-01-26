<?php

namespace App\Filament\Resources\Courses\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class CourseForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Course Information')
                    ->description('Enter the course details')
                    ->icon('heroicon-o-book-open')
                    ->schema([
                        Select::make('department_id')
                            ->label('Department')
                            ->relationship('department', 'name')
                            ->preload()
                            ->searchable()
                            ->native(false)
                            ->required(),
                        TextInput::make('name')
                            ->label('Course Name')
                            ->placeholder('e.g., Introduction to Programming')
                            ->maxLength(255)
                            ->required(),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),
            ]);
    }
}
