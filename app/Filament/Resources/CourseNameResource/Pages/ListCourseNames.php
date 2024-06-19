<?php

namespace App\Filament\Resources\CourseNameResource\Pages;

use App\Filament\Resources\CourseNameResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCourseNames extends ListRecords
{
    protected static string $resource = CourseNameResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
