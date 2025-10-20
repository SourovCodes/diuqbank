<?php

namespace App\Filament\Resources\Questions\Pages;

use App\Filament\Resources\Questions\QuestionResource;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditQuestion extends EditRecord
{
    protected static string $resource = QuestionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('view')
                ->label('View Public Page')
                ->icon('heroicon-o-eye')
                ->color('gray')
                ->url(fn (): string => route('questions.show', ['id' => $this->record]))
                ->openUrlInNewTab(),
            DeleteAction::make(),
        ];
    }
}
