<?php

namespace App\Filament\Resources\Questions\Schemas;

use App\Models\Course;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;

class QuestionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Academic Information')
                    ->description('Select the department and course for this question')
                    ->icon('heroicon-o-academic-cap')
                    ->schema([
                        Select::make('department_id')
                            ->relationship('department', 'name')
                            ->placeholder('Select a department')
                            ->native(false)
                            ->preload()
                            ->searchable()
                            ->live()
                            ->afterStateUpdated(fn (callable $set) => $set('course_id', null))
                            ->required(),
                        Select::make('course_id')
                            ->label('Course')
                            ->placeholder('Select a course')
                            ->native(false)
                            ->options(fn (Get $get) => Course::query()
                                ->where('department_id', $get('department_id'))
                                ->pluck('name', 'id'))
                            ->preload()
                            ->searchable()
                            ->required(),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),
                Section::make('Exam Details')
                    ->description('Specify when this question was used')
                    ->icon('heroicon-o-clipboard-document-list')
                    ->schema([
                        Select::make('semester_id')
                            ->relationship('semester', 'name')
                            ->placeholder('Select a semester')
                            ->native(false)
                            ->preload()
                            ->searchable()
                            ->required(),
                        Select::make('exam_type_id')
                            ->relationship('examType', 'name')
                            ->placeholder('Select an exam type')
                            ->native(false)
                            ->preload()
                            ->searchable()
                            ->required(),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),
            ]);
    }
}
