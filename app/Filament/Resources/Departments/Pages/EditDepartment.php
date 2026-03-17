<?php

namespace App\Filament\Resources\Departments\Pages;

use App\Filament\Resources\Departments\DepartmentResource;
use App\Repositories\QuestionFormOptionsRepository;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditDepartment extends EditRecord
{
    protected static string $resource = DepartmentResource::class;

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
