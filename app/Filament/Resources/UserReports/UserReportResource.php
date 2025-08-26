<?php

namespace App\Filament\Resources\UserReports;

use App\Filament\Resources\UserReports\Pages\CreateUserReport;
use App\Filament\Resources\UserReports\Pages\EditUserReport;
use App\Filament\Resources\UserReports\Pages\ListUserReports;
use App\Filament\Resources\UserReports\Schemas\UserReportForm;
use App\Filament\Resources\UserReports\Tables\UserReportsTable;
use App\Models\UserReport;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class UserReportResource extends Resource
{
    protected static ?string $model = UserReport::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedFlag;

    public static function form(Schema $schema): Schema
    {
        return UserReportForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return UserReportsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListUserReports::route('/'),
            'create' => CreateUserReport::route('/create'),
            'edit' => EditUserReport::route('/{record}/edit'),
        ];
    }
}
