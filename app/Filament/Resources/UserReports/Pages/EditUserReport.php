<?php

namespace App\Filament\Resources\UserReports\Pages;

use App\Filament\Resources\UserReports\Pages\Concerns\HasPublishRejectActions;
use App\Filament\Resources\UserReports\UserReportResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditUserReport extends EditRecord
{
    use HasPublishRejectActions;

    protected static string $resource = UserReportResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ...$this->getPublishRejectActions(),
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
