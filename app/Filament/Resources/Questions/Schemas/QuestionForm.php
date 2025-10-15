<?php

namespace App\Filament\Resources\Questions\Schemas;

use App\Enums\QuestionStatus;
use App\Enums\UnderReviewReason;
use App\Models\Course;
use App\Models\ExamType;
use App\Models\Question;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\View;
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
                Section::make('Status & Review')
                    ->columns(2)
                    ->columnSpanFull()
                    ->schema([
                        Select::make('status')
                            ->label('Status')
                            ->options(QuestionStatus::class)
                            ->default(QuestionStatus::PUBLISHED)
                            ->required()
                            ->live()
                            ->afterStateHydrated(function (Select $component, $state) {
                                // Force re-evaluation of dependent fields on load
                                $component->state($state);
                            }),
                        Select::make('under_review_reason')
                            ->label('Under Review Reason')
                            ->options(UnderReviewReason::class)
                            ->live()
                            ->visible(fn (callable $get): bool => $get('status') === QuestionStatus::PENDING_REVIEW)
                            ->required(fn (callable $get): bool => $get('status') === QuestionStatus::PENDING_REVIEW),
                        Textarea::make('duplicate_reason')
                            ->label('Duplicate Reason')
                            ->rows(3)
                            ->maxLength(1000)
                            ->columnSpanFull()
                            ->visible(fn (callable $get): bool => $get('under_review_reason') === UnderReviewReason::DUPLICATE),
                        View::make('filament.resources.questions.duplicate-pdf-comparison')
                            ->viewData(fn (?Question $record): array => [
                                'record' => $record,
                                'originalQuestion' => $record ? self::findOriginalQuestion($record) : null,
                            ])
                            ->columnSpanFull()
                            ->visible(fn (callable $get, ?Question $record): bool => $get('under_review_reason') === UnderReviewReason::DUPLICATE &&
                                $record?->getFirstMedia('pdf') !== null
                            ),
                    ]),
                Section::make('Attachments')
                    ->columnSpanFull()
                    ->schema([
                        SpatieMediaLibraryFileUpload::make('pdf')
                            ->label('Question PDF')
                            ->collection('pdf')
                            ->preserveFilenames()
                            ->acceptedFileTypes(['application/pdf'])
                            ->maxSize(10240)
                            ->required()
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

    protected static function findOriginalQuestion(Question $currentQuestion): ?Question
    {
        return Question::query()
            ->where('department_id', $currentQuestion->department_id)
            ->where('course_id', $currentQuestion->course_id)
            ->where('semester_id', $currentQuestion->semester_id)
            ->where('exam_type_id', $currentQuestion->exam_type_id)
            ->where('section', $currentQuestion->section)
            ->where('status', QuestionStatus::PUBLISHED)
            ->where('id', '!=', $currentQuestion->id)
            ->orderBy('created_at', 'asc')
            ->first();
    }
}
