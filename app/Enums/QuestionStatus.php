<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum QuestionStatus: string implements HasColor, HasIcon, HasLabel
{
    case PUBLISHED = 'published';
    case PENDING_REVIEW = 'pending_review';
    case NEED_FIX = 'need_fix';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::PUBLISHED => 'Published',
            self::PENDING_REVIEW => 'Pending Review',
            self::NEED_FIX => 'Need Fix',
        };
    }

    public function getColor(): string|array|null
    {
        return match ($this) {
            self::PUBLISHED => 'success',
            self::PENDING_REVIEW => 'warning',
            self::NEED_FIX => 'danger',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::PUBLISHED => 'heroicon-m-check-circle',
            self::PENDING_REVIEW => 'heroicon-m-clock',
            self::NEED_FIX => 'heroicon-m-x-circle',
        };
    }
}
