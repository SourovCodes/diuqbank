<?php

namespace App\Filament\Resources\ExamTypes\Pages;

use App\Filament\Resources\ExamTypes\ExamTypeResource;
use App\Repositories\QuestionFormOptionsRepository;
use Filament\Resources\Pages\CreateRecord;

class CreateExamType extends CreateRecord
{
    protected static string $resource = ExamTypeResource::class;

    protected function afterCreate(): void
    {
        app(QuestionFormOptionsRepository::class)->clearCache();
    }
}
