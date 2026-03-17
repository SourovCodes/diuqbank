<?php

namespace App\Filament\Resources\Votes\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class VotesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('submission.question.course.name')
                    ->label('Question')
                    ->formatStateUsing(fn ($state, $record) => $record->submission?->question?->title ?? 'N/A')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('submission.user.name')
                    ->label('Submitted By')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('user.name')
                    ->label('Voter')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('value')
                    ->label('Vote')
                    ->badge()
                    ->formatStateUsing(fn ($state) => $state === 1 ? 'Upvote' : 'Downvote')
                    ->color(fn ($state) => $state === 1 ? 'success' : 'danger'),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('value')
                    ->label('Vote Type')
                    ->options([
                        1 => 'Upvote',
                        -1 => 'Downvote',
                    ]),
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
