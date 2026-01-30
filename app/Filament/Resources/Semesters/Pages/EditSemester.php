<?php

namespace App\Filament\Resources\Semesters\Pages;

use App\Filament\Resources\Semesters\SemesterResource;
use App\Repositories\QuestionFormOptionsRepository;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSemester extends EditRecord
{
    protected static string $resource = SemesterResource::class;

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
