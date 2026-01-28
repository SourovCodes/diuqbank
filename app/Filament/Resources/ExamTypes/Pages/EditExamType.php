<?php

namespace App\Filament\Resources\ExamTypes\Pages;

use App\Filament\Resources\ExamTypes\ExamTypeResource;
use App\Repositories\QuestionFormOptionsRepository;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditExamType extends EditRecord
{
    protected static string $resource = ExamTypeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }

    protected function afterSave(): void
    {
        app(QuestionFormOptionsRepository::class)->clearCache();
    }

    protected function afterDelete(): void
    {
        app(QuestionFormOptionsRepository::class)->clearCache();
    }
}
