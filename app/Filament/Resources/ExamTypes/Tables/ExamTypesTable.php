<?php

namespace App\Filament\Resources\ExamTypes\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ExamTypesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query->withCount('questions'))
            ->defaultSort('name')
            ->columns([
                TextColumn::make('name')
                    ->label('Exam type')
                    ->searchable()
                    ->sortable(),
                IconColumn::make('requires_section')
                    ->label('Needs section')
                    ->boolean()
                    ->sortable()
                    ->color(fn (bool $state): string => $state ? 'success' : 'gray'),
                TextColumn::make('questions_count')
                    ->label('Questions')
                    ->counts('questions')
                    ->badge()
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                TernaryFilter::make('requires_section')
                    ->label('Requires section')
                    ->placeholder('Any')
                    ->trueLabel('Requires section')
                    ->falseLabel('Does not require section')
                    ->queries(
                        true: fn (Builder $query): Builder => $query->where('requires_section', true),
                        false: fn (Builder $query): Builder => $query->where('requires_section', false),
                    ),
                TernaryFilter::make('has_questions')
                    ->label('Has questions')
                    ->placeholder('Any')
                    ->trueLabel('With questions')
                    ->falseLabel('Without questions')
                    ->queries(
                        true: fn (Builder $query): Builder => $query->whereHas('questions'),
                        false: fn (Builder $query): Builder => $query->whereDoesntHave('questions'),
                    ),
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
