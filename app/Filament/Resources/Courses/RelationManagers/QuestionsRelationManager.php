<?php

namespace App\Filament\Resources\Courses\RelationManagers;

use App\Enums\QuestionStatus;
use App\Models\Course;
use App\Models\Department;
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
                SelectFilter::make('status')
                    ->options(QuestionStatus::class),
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
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('moveToCourse')
                        ->label('Move to Course')
                        ->icon('heroicon-o-arrow-right-circle')
                        ->form([
                            Select::make('department_id')
                                ->label('Department')
                                ->options(Department::query()->pluck('name', 'id'))
                                ->searchable()
                                ->required()
                                ->reactive()
                                ->afterStateUpdated(fn (callable $set) => $set('course_id', null)),
                            Select::make('course_id')
                                ->label('Course')
                                ->options(function (callable $get) {
                                    $departmentId = $get('department_id');
                                    if (! $departmentId) {
                                        return [];
                                    }

                                    return Course::where('department_id', $departmentId)->pluck('name', 'id');
                                })
                                ->searchable()
                                ->required(),
                        ])
                        ->action(function (Collection $records, array $data): void {
                            $records->each->update([
                                'department_id' => $data['department_id'],
                                'course_id' => $data['course_id'],
                            ]);

                            Notification::make()
                                ->success()
                                ->title('Questions moved')
                                ->body("{$records->count()} question(s) moved to new course.")
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
