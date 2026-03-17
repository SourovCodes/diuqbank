<?php

namespace App\Filament\Resources\Departments\RelationManagers;

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
                    BulkAction::make('moveToDepartment')
                        ->label('Move to Department')
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
                                ->label('Course (Optional)')
                                ->options(function (callable $get) {
                                    $departmentId = $get('department_id');
                                    if (! $departmentId) {
                                        return [];
                                    }

                                    return Course::where('department_id', $departmentId)->pluck('name', 'id');
                                })
                                ->searchable()
                                ->helperText('Leave empty to keep the current course if it belongs to the new department'),
                        ])
                        ->action(function (Collection $records, array $data): void {
                            $updated = 0;
                            foreach ($records as $record) {
                                $updateData = ['department_id' => $data['department_id']];

                                if (! empty($data['course_id'])) {
                                    $updateData['course_id'] = $data['course_id'];
                                } else {
                                    // Check if current course belongs to new department
                                    $course = Course::find($record->course_id);
                                    if ($course && $course->department_id !== $data['department_id']) {
                                        // Get first course in new department or set to null
                                        $newCourse = Course::where('department_id', $data['department_id'])->first();
                                        $updateData['course_id'] = $newCourse?->id;
                                    }
                                }

                                $record->update($updateData);
                                $updated++;
                            }

                            Notification::make()
                                ->success()
                                ->title('Questions moved')
                                ->body("{$updated} question(s) moved successfully.")
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
