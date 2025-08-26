<?php

namespace App\Filament\Resources\UserReports\Pages\Concerns;

use App\Enums\QuestionStatus;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;

trait HasPublishRejectActions
{
    /**
     * Common header actions for publishing or rejecting the main PDF's related question.
     *
     * @return array<int, Action>
     */
    protected function getPublishRejectActions(): array
    {
        return [
            Action::make('publish')
                ->label('Publish')
                ->icon(Heroicon::OutlinedCheckCircle)
                ->color('success')
                ->requiresConfirmation()
                ->visible(fn () => (bool) $this->getRecord()?->question)
                ->disabled(fn () => $this->getRecord()?->question?->status === QuestionStatus::PUBLISHED)
                ->action(function () {
                    $report = $this->getRecord();
                    $question = $report?->question;
                    if (! $question) {
                        return;
                    }

                    $question->update(['status' => QuestionStatus::PUBLISHED]);
                    $report->update(['reviewed' => true]);

                    Notification::make()
                        ->success()
                        ->title('Question published')
                        ->body('The question has been published.')
                        ->send();
                }),

            Action::make('reject')
                ->label('Reject')
                ->icon(Heroicon::OutlinedXCircle)
                ->color('danger')
                ->requiresConfirmation()
                ->visible(fn () => (bool) $this->getRecord()?->question)
                ->disabled(fn () => $this->getRecord()?->question?->status === QuestionStatus::REJECTED)
                ->action(function () {
                    $report = $this->getRecord();
                    $question = $report?->question;
                    if (! $question) {
                        return;
                    }

                    $question->update(['status' => QuestionStatus::REJECTED]);
                    $report->update(['reviewed' => true]);

                    Notification::make()
                        ->warning()
                        ->title('Question rejected')
                        ->body('The question has been rejected.')
                        ->send();
                }),
        ];
    }
}
