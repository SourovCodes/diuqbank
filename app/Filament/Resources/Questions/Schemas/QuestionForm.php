<?php

namespace App\Filament\Resources\Questions\Schemas;

use App\Enums\QuestionStatus;
use App\Models\Course;
use App\Models\ExamType;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;

class QuestionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                Select::make('department_id')
                    ->relationship('department', 'name')
                    ->required()
                    ->reactive()
                    ->afterStateUpdated(fn (callable $set) => $set('course_id', null)),
                Select::make('course_id')
                    ->options(fn (Get $get): array => $get('department_id')
                            ? Course::where('department_id', $get('department_id'))->pluck('name', 'id')->toArray()
                            : []
                    )
                    ->required()
                    ->reactive(),
                Select::make('semester_id')
                    ->relationship('semester', 'name')
                    ->required(),
                Select::make('exam_type_id')
                    ->relationship('examType', 'name')
                    ->required()
                    ->reactive()
                    ->afterStateUpdated(fn (callable $set) => $set('section', null)),
                TextInput::make('section')
                    ->required(function (Get $get): bool {
                        if (! $get('exam_type_id')) {
                            return false;
                        }

                        $examType = ExamType::find($get('exam_type_id'));

                        return $examType ? $examType->requires_section : false;
                    })
                    ->visible(function (Get $get): bool {
                        if (! $get('exam_type_id')) {
                            return false;
                        }

                        $examType = ExamType::find($get('exam_type_id'));

                        return $examType ? $examType->requires_section : false;
                    }),
                Select::make('status')
                    ->options(QuestionStatus::class)
                    ->default('pending_review')
                    ->required(),
                TextInput::make('view_count')
                    ->required()
                    ->numeric(),
            ]);
    }
}
