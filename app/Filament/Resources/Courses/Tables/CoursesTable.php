<?php

namespace App\Filament\Resources\Courses\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class CoursesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query->with('department')->withCount('questions'))
            ->defaultSort('name')
            ->columns([
                TextColumn::make('name')
                    ->label('Course')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('department.name')
                    ->label('Department')
                    ->searchable()
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
                SelectFilter::make('department')
                    ->label('Department')
                    ->relationship('department', 'name')
                    ->searchable(),
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
