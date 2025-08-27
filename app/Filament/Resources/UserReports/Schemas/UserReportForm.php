<?php

namespace App\Filament\Resources\UserReports\Schemas;

use App\Enums\UserReportType;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class UserReportForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                Select::make('question_id')
                    ->relationship('question', 'id')
                    ->required(),
                Select::make('type')
                    ->options(UserReportType::class)
                    ->required(),
                Textarea::make('details')
                    ->required()
                    ->columnSpanFull(),
                Toggle::make('reviewed')
                    ->required(),
            ]);
    }
}
