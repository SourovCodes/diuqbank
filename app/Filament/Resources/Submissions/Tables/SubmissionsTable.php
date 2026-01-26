<?php

namespace App\Filament\Resources\Submissions\Tables;

use App\Models\Question;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class SubmissionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('question.department.short_name')
                    ->label('Dept')
                    ->badge()
                    ->sortable(),
                TextColumn::make('question.course.name')
                    ->label('Course')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('question.semester.name')
                    ->label('Semester')
                    ->sortable(),
                TextColumn::make('question.examType.name')
                    ->label('Exam')
                    ->badge()
                    ->color('success'),
                TextColumn::make('user.name')
                    ->label('Submitted By')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('views')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('votes_sum_value')
                    ->sum('votes', 'value')
                    ->label('Score')
                    ->sortable()
                    ->badge()
                    ->color(fn ($state) => match (true) {
                        $state > 0 => 'success',
                        $state < 0 => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('question')
                    ->relationship('question', 'id')
                    ->getOptionLabelFromRecordUsing(fn (Question $record) => "{$record->department->short_name} - {$record->course->name}")
                    ->preload()
                    ->searchable(),
                SelectFilter::make('user')
                    ->relationship('user', 'name')
                    ->preload()
                    ->searchable(),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
