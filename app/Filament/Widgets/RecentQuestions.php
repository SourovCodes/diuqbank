<?php

namespace App\Filament\Widgets;

use App\Models\Question;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use Illuminate\Database\Eloquent\Builder;

class RecentQuestions extends TableWidget
{
    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Latest questions';

    public function table(Table $table): Table
    {
        return $table
            ->query(fn (): Builder => Question::query()
                ->with(['course', 'department', 'examType', 'semester'])
                ->latest())
            ->columns([
                Tables\Columns\TextColumn::make('course.name')
                    ->label('Course')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('examType.name')
                    ->label('Exam Type')
                    ->sortable(),
                Tables\Columns\TextColumn::make('semester.name')
                    ->label('Semester')
                    ->sortable(),
                Tables\Columns\TextColumn::make('section')
                    ->label('Section')
                    ->formatStateUsing(fn (?string $state): string => $state ?? '—'),
                Tables\Columns\TextColumn::make('view_count')
                    ->label('Views')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Uploaded')
                    ->since()
                    ->sortable()
                    ->tooltip(fn (Question $record): ?string => $record->created_at?->toDateTimeString()),
            ])
            ->paginated([5, 10, 25])
            ->defaultPaginationPageOption(5)
            ->emptyStateHeading('No questions yet')
            ->emptyStateDescription('Create your first question to populate this feed.')
            ->emptyStateIcon('heroicon-o-document-text');
    }
}
