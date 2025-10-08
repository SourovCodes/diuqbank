<?php

namespace App\Filament\Resources\ExamTypes\Pages;

use App\Filament\Resources\ExamTypes\ExamTypeResource;
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
}
