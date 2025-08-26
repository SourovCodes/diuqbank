<?php

namespace App\Filament\Resources\UserReports\Schemas;

use App\Enums\UserReportType;
use App\Filament\Resources\Questions\QuestionResource;
use App\Models\Question;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class UserReportInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Report')
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        TextEntry::make('user.name')
                            ->label('Reported By')
                            ->icon(Heroicon::OutlinedUserCircle),

                        TextEntry::make('question.id')
                            ->label('Question')
                            ->icon(Heroicon::OutlinedDocumentText)
                            ->formatStateUsing(fn ($state) => filled($state) ? ("#{$state}") : null)
                            ->url(fn ($record) => $record?->question ? QuestionResource::getUrl('edit', ['record' => $record->question]) : null)
                            ->openUrlInNewTab(),

                        TextEntry::make('type')
                            ->label('Type')
                            ->badge()
                            ->icon(fn ($state) => $state?->getIcon())
                            ->color(fn ($state) => $state?->getColor())
                            ->formatStateUsing(fn ($state) => $state?->getLabel()),

                        IconEntry::make('reviewed')
                            ->label('Reviewed')
                            ->boolean(),

                        TextEntry::make('created_at')
                            ->label('Reported At')
                            ->icon(Heroicon::OutlinedClock)
                            ->dateTime(),

                        TextEntry::make('updated_at')
                            ->label('Last Updated')
                            ->icon(Heroicon::OutlinedClock)
                            ->dateTime(),

                        TextEntry::make('details')
                            ->label('Details')
                            ->prose()
                            ->columnSpanFull(),
                    ]),

                Section::make('Question')
                    ->schema([
                        TextEntry::make('question.department.short_name')
                            ->badge()
                            ->icon(Heroicon::OutlinedBuildingLibrary)
                            ->label('Department'),

                        TextEntry::make('question.course.name')
                            ->badge()
                            ->icon(Heroicon::OutlinedBookOpen)
                            ->label('Course'),

                        TextEntry::make('question.semester.name')
                            ->badge()
                            ->icon(Heroicon::OutlinedCalendar)
                            ->label('Semester'),

                        TextEntry::make('question.examType.name')
                            ->badge()
                            ->icon(Heroicon::OutlinedTicket)
                            ->label('Exam Type'),

                        TextEntry::make('question.pdf_url')
                            ->label('PDF URL')
                            ->icon(Heroicon::OutlinedLink)
                            ->copyable()
                            ->url(fn ($state) => $state)
                            ->openUrlInNewTab()
                            ->columnSpanFull(),
                    ])
                    ->columnSpanFull()
                    ->columns(2)
                    ->collapsible(),

                Section::make('Similar Questions')
                    ->visible(fn ($record) => $record?->type === UserReportType::DUPLICATE_ALLOW_REQUEST && filled($record?->question))
                    ->schema([
                        RepeatableEntry::make('similar_questions')
                            ->state(function ($record) {
                                $q = $record?->question;
                                if (! $q) {
                                    return [];
                                }

                                return Question::query()
                                    ->published()
                                    ->where('department_id', $q->department_id)
                                    ->where('course_id', $q->course_id)
                                    ->where('semester_id', $q->semester_id)
                                    ->where('exam_type_id', $q->exam_type_id)
                                    ->when(is_null($q->section), fn ($query) => $query->whereNull('section'), fn ($query) => $query->where('section', $q->section))
                                    ->whereKeyNot($q->id)
                                    ->latest()
                                    ->limit(5)
                                    ->get();
                            })
                            ->placeholder('No similar questions found')
                            ->columns(2)
                            ->schema([
                                TextEntry::make('id')
                                    ->label('Question')
                                    ->icon(Heroicon::OutlinedDocumentText)
                                    ->formatStateUsing(fn ($state) => filled($state) ? ("#{$state}") : null)
                                    ->url(fn ($record) => QuestionResource::getUrl('edit', ['record' => $record]))
                                    ->openUrlInNewTab(),

                                TextEntry::make('section')
                                    ->label('Section')
                                    ->badge()
                                    ->icon(Heroicon::OutlinedRectangleGroup),

                                TextEntry::make('view_count')
                                    ->label('Views')
                                    ->icon(Heroicon::OutlinedEye),

                                TextEntry::make('created_at')
                                    ->label('Created')
                                    ->icon(Heroicon::OutlinedClock)
                                    ->dateTime(),

                                TextEntry::make('pdf_url')
                                    ->label('PDF URL')
                                    ->icon(Heroicon::OutlinedLink)
                                    ->copyable()
                                    ->url(fn ($state) => $state)
                                    ->openUrlInNewTab()
                                    ->columnSpanFull(),
                            ]),
                    ])
                    ->columnSpanFull()
                    ->collapsible(),
            ]);
    }
}
