<?php

namespace App\Filament\Resources\Courses\Pages;

use App\Filament\Resources\Courses\CourseResource;
use App\Repositories\QuestionFormOptionsRepository;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCourse extends EditRecord
{
    protected static string $resource = CourseResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->after(fn () => app(QuestionFormOptionsRepository::class)->clearCache()),
        ];
    }

    protected function afterSave(): void
    {
        app(QuestionFormOptionsRepository::class)->clearCache();
    }
}
