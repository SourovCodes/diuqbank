<?php

namespace App\Filament\Resources\Questions\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class QuestionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('department.short_name')
                    ->label('Dept')
                    ->badge()
                    ->sortable()
                    ->searchable(),
                TextColumn::make('course.name')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('semester.name')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('examType.name')
                    ->label('Exam Type')
                    ->badge()
                    ->color('success')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('submissions_count')
                    ->counts('submissions')
                    ->label('Submissions')
                    ->sortable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('department')
                    ->relationship('department', 'name')
                    ->preload()
                    ->searchable(),
                SelectFilter::make('semester')
                    ->relationship('semester', 'name')
                    ->preload()
                    ->searchable(),
                SelectFilter::make('examType')
                    ->relationship('examType', 'name')
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
