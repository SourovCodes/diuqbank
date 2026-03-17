<?php

namespace App\Filament\Resources\ExamTypes\RelationManagers;

use App\Enums\QuestionStatus;
use App\Models\ExamType;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

class QuestionsRelationManager extends RelationManager
{
    protected static string $relationship = 'questions';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('id')
            ->columns([
                TextColumn::make('status')
                    ->badge()
                    ->sortable(),
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
                SelectFilter::make('status')
                    ->options(QuestionStatus::class),
                SelectFilter::make('department')
                    ->relationship('department', 'name')
                    ->preload()
                    ->searchable(),
                SelectFilter::make('semester')
                    ->relationship('semester', 'name')
                    ->preload()
                    ->searchable(),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('moveToExamType')
                        ->label('Move to Exam Type')
                        ->icon('heroicon-o-arrow-right-circle')
                        ->form([
                            Select::make('exam_type_id')
                                ->label('Exam Type')
                                ->options(ExamType::query()->pluck('name', 'id'))
                                ->searchable()
                                ->required(),
                        ])
                        ->action(function (Collection $records, array $data): void {
                            $records->each->update(['exam_type_id' => $data['exam_type_id']]);

                            Notification::make()
                                ->success()
                                ->title('Questions moved')
                                ->body("{$records->count()} question(s) moved to new exam type.")
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
