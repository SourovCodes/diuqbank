<?php

namespace App\Filament\Resources\Semesters\Pages;

use App\Filament\Resources\Semesters\SemesterResource;
use App\Repositories\QuestionFormOptionsRepository;
use Filament\Resources\Pages\CreateRecord;

class CreateSemester extends CreateRecord
{
    protected static string $resource = SemesterResource::class;

    protected function afterCreate(): void
    {
        app(QuestionFormOptionsRepository::class)->clearCache();
    }
}
