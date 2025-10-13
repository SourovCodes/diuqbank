<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum UnderReviewReason: string implements HasColor, HasIcon, HasLabel
{
    case DUPLICATE = 'duplicate';
    case NEW_USER = 'new_user';
    case NEW_FILTER_OPTION = 'new_filter_option';
    case MULTIPLE_USER_REPORTS = 'multiple_user_reports';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::DUPLICATE => 'Duplicate',
            self::NEW_USER => 'New User',
            self::NEW_FILTER_OPTION => 'New Filter Option',
            self::MULTIPLE_USER_REPORTS => 'Multiple User Reports',
        };
    }

    public function getColor(): string|array|null
    {
        return match ($this) {
            self::DUPLICATE => 'danger',
            self::NEW_USER => 'info',
            self::NEW_FILTER_OPTION => 'warning',
            self::MULTIPLE_USER_REPORTS => 'danger',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::DUPLICATE => 'heroicon-m-document-duplicate',
            self::NEW_USER => 'heroicon-m-user-plus',
            self::NEW_FILTER_OPTION => 'heroicon-m-funnel',
            self::MULTIPLE_USER_REPORTS => 'heroicon-m-flag',
        };
    }
}
