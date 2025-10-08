<?php

namespace App\Filament\Resources\Departments\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class DepartmentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query->withCount(['courses', 'questions']))
            ->defaultSort('name')
            ->columns([
                TextColumn::make('name')
                    ->label('Department')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('short_name')
                    ->label('Code')
                    ->badge()
                    ->sortable()
                    ->searchable(),
                TextColumn::make('courses_count')
                    ->label('Courses')
                    ->counts('courses')
                    ->badge()
                    ->alignRight()
                    ->sortable(),
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
                TernaryFilter::make('has_courses')
                    ->label('Has courses')
                    ->placeholder('Any')
                    ->trueLabel('With courses')
                    ->falseLabel('Without courses')
                    ->queries(
                        true: fn (Builder $query): Builder => $query->whereHas('courses'),
                        false: fn (Builder $query): Builder => $query->whereDoesntHave('courses'),
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
