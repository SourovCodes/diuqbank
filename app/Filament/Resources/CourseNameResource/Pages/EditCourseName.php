<?php

namespace App\Filament\Resources\CourseNameResource\Pages;

use App\Filament\Resources\CourseNameResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCourseName extends EditRecord
{
    protected static string $resource = CourseNameResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
