<?php

namespace App\Filament\Resources\Semesters;

use App\Filament\Resources\Semesters\Pages\CreateSemester;
use App\Filament\Resources\Semesters\Pages\EditSemester;
use App\Filament\Resources\Semesters\Pages\ListSemesters;
use App\Filament\Resources\Semesters\Schemas\SemesterForm;
use App\Filament\Resources\Semesters\Tables\SemestersTable;
use App\Models\Semester;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class SemesterResource extends Resource
{
    protected static ?string $model = Semester::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCalendarDays;

    public static function form(Schema $schema): Schema
    {
        return SemesterForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SemestersTable::configure($table);
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
            'index' => ListSemesters::route('/'),
            'create' => CreateSemester::route('/create'),
            'edit' => EditSemester::route('/{record}/edit'),
        ];
    }

    public static function getGloballySearchableAttributes(): array
    {
        return [
            'name',
        ];
    }

    public static function getGlobalSearchResultDetails(Model $record): array
    {
        return [
            'Questions' => (string) ($record->questions_count ?? 0),
        ];
    }

    public static function getGlobalSearchEloquentQuery(): Builder
    {
        return parent::getGlobalSearchEloquentQuery()->withCount('questions');
    }
}
