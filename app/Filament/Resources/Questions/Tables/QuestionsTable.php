<?php

namespace App\Filament\Resources\Questions\Tables;

use App\Enums\QuestionStatus;
use App\Models\Question;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class QuestionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query->with(['course', 'department', 'examType', 'semester', 'user']))
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('course.name')
                    ->label('Course')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('department.short_name')
                    ->label('Department')
                    ->badge()
                    ->searchable()
                    ->sortable(),
                TextColumn::make('semester.name')
                    ->label('Semester')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('examType.name')
                    ->label('Exam type')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('section')
                    ->badge()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('status')
                    ->badge()
                    ->sortable(),
                TextColumn::make('user.name')
                    ->label('Uploaded by')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('view_count')
                    ->label('Views')
                    ->numeric()
                    ->alignRight()
                    ->sortable(),
                IconColumn::make('has_pdf')
                    ->label('PDF')
                    ->boolean()
                    ->state(fn (Question $record): bool => $record->hasMedia('pdf')),
                TextColumn::make('created_at')
                    ->label('Uploaded')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->label('Updated')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('department')
                    ->label('Department')
                    ->relationship('department', 'name')
                    ->searchable(),
                SelectFilter::make('course')
                    ->label('Course')
                    ->relationship('course', 'name')
                    ->searchable(),
                SelectFilter::make('semester')
                    ->label('Semester')
                    ->relationship('semester', 'name')
                    ->searchable(),
                SelectFilter::make('examType')
                    ->label('Exam type')
                    ->relationship('examType', 'name')
                    ->searchable(),
                SelectFilter::make('status')
                    ->label('Status')
                    ->options(QuestionStatus::class),
                TernaryFilter::make('has_pdf')
                    ->label('Has PDF')
                    ->placeholder('Any')
                    ->trueLabel('With PDF')
                    ->falseLabel('Without PDF')
                    ->queries(
                        true: fn (Builder $query): Builder => $query->whereHas('media', fn (Builder $media): Builder => $media->where('collection_name', 'pdf')),
                        false: fn (Builder $query): Builder => $query->whereDoesntHave('media', fn (Builder $media): Builder => $media->where('collection_name', 'pdf')),
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
