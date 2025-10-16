<?php

namespace App\Filament\Resources\ContactFormSubmissions;

use App\Filament\Resources\ContactFormSubmissions\Pages\EditContactFormSubmission;
use App\Filament\Resources\ContactFormSubmissions\Pages\ListContactFormSubmissions;
use App\Filament\Resources\ContactFormSubmissions\Schemas\ContactFormSubmissionForm;
use App\Filament\Resources\ContactFormSubmissions\Tables\ContactFormSubmissionsTable;
use App\Models\ContactFormSubmission;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ContactFormSubmissionResource extends Resource
{
    protected static ?string $model = ContactFormSubmission::class;

    protected static ?string $recordTitleAttribute = 'name';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Envelope;

    protected static ?string $navigationLabel = 'Contact Submissions';

    protected static ?string $modelLabel = 'Contact Submission';

    protected static ?string $pluralModelLabel = 'Contact Submissions';

    public static function form(Schema $schema): Schema
    {
        return ContactFormSubmissionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ContactFormSubmissionsTable::configure($table);
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
            'index' => ListContactFormSubmissions::route('/'),
            'edit' => EditContactFormSubmission::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
