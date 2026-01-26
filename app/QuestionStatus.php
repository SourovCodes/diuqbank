<?php

namespace App;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum QuestionStatus: string implements HasColor, HasIcon, HasLabel
{
    case Published = 'published';
    case PendingReview = 'pending_review';
    case Rejected = 'rejected';

    public function getLabel(): string
    {
        return match ($this) {
            self::Published => 'Published',
            self::PendingReview => 'Pending Review',
            self::Rejected => 'Rejected',
        };
    }

    public function getColor(): string|array|null
    {
        return match ($this) {
            self::Published => 'success',
            self::PendingReview => 'warning',
            self::Rejected => 'danger',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::Published => 'heroicon-o-check-circle',
            self::PendingReview => 'heroicon-o-clock',
            self::Rejected => 'heroicon-o-x-circle',
        };
    }
}
