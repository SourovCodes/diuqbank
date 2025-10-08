<?php

namespace App\Filament\Resources\Questions\Schemas;

use App\Models\Course;
use App\Models\ExamType;
use App\Models\Question;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class QuestionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Question associations')
                    ->columns(2)
                    ->columnSpanFull()
                    ->schema([
                        Select::make('user_id')
                            ->label('Uploader')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Select::make('department_id')
                            ->label('Department')
                            ->relationship('department', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->live()
                            ->afterStateUpdated(fn (callable $set) => $set('course_id', null)),
                        Select::make('course_id')
                            ->label('Course')
                            ->options(fn (callable $get): array => Course::query()
                                ->when(
                                    $get('department_id'),
                                    fn (Builder $query, $departmentId) => $query->where('department_id', $departmentId),
                                )
                                ->orderBy('name')
                                ->pluck('name', 'id')
                                ->all())
                            ->searchable()
                            ->preload()
                            ->required()
                            ->live()
                            ->disabled(fn (callable $get): bool => blank($get('department_id'))),
                        Select::make('semester_id')
                            ->label('Semester')
                            ->relationship('semester', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Select::make('exam_type_id')
                            ->label('Exam type')
                            ->relationship('examType', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->live()
                            ->afterStateUpdated(fn (callable $set) => $set('section', null)),
                        TextInput::make('section')
                            ->label('Section')
                            ->placeholder('A')
                            ->maxLength(10)
                            ->helperText('Required when the selected exam type requires a section.')
                            ->live(onBlur: true)
                            ->dehydrateStateUsing(fn (?string $state): ?string => filled($state) ? Str::upper(Str::squish($state)) : null)
                            ->formatStateUsing(fn (?string $state): ?string => filled($state) ? Str::upper(Str::squish($state)) : null)
                            ->required(fn (callable $get): bool => self::requiresSection($get('exam_type_id')))
                            ->visible(fn (callable $get): bool => self::requiresSection($get('exam_type_id'))),
                    ]),
                Section::make('Attachments')
                    ->columnSpanFull()
                    ->schema([
                        SpatieMediaLibraryFileUpload::make('pdf')
                            ->label('Question PDF')
                            ->collection('pdf')
                            ->disk('public')
                            ->preserveFilenames()
                            ->acceptedFileTypes(['application/pdf'])
                            ->maxSize(10240)
                            ->required(fn (?Question $record): bool => blank($record?->getFirstMedia('pdf')))
                            ->openable()
                            ->downloadable(),
                    ]),
            ]);
    }

    protected static function requiresSection(null|int|string $examTypeId): bool
    {
        if (blank($examTypeId)) {
            return false;
        }

        return (bool) ExamType::query()
            ->whereKey($examTypeId)
            ->value('requires_section');
    }
}
