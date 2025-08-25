<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum UserReportType: string implements HasColor, HasIcon, HasLabel
{
    case DUPLICATE_ALLOW_REQUEST = 'duplicate_allow_request';
    case INAPPROPRIATE_PDF_FOR_COMMUNITY = 'inappropriate_pdf_for_community';
    case WRONG_INFO_GIVEN_ABOUT_QUESTION = 'wrong_info_given_about_question';
    case OTHER = 'other';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::DUPLICATE_ALLOW_REQUEST => 'Duplicate Allow Request',
            self::INAPPROPRIATE_PDF_FOR_COMMUNITY => 'Inappropriate PDF for Community',
            self::WRONG_INFO_GIVEN_ABOUT_QUESTION => 'Wrong Info Given About Question',
            self::OTHER => 'Other',
        };
    }

    public function getColor(): string|array|null
    {
        return match ($this) {
            self::DUPLICATE_ALLOW_REQUEST => 'primary',
            self::INAPPROPRIATE_PDF_FOR_COMMUNITY => 'danger',
            self::WRONG_INFO_GIVEN_ABOUT_QUESTION => 'warning',
            self::OTHER => 'gray',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::DUPLICATE_ALLOW_REQUEST => 'heroicon-m-document-duplicate',
            self::INAPPROPRIATE_PDF_FOR_COMMUNITY => 'heroicon-m-exclamation-triangle',
            self::WRONG_INFO_GIVEN_ABOUT_QUESTION => 'heroicon-m-exclamation-circle',
            self::OTHER => 'heroicon-m-ellipsis-horizontal',
        };
    }
}
