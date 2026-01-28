<?php

namespace App\Filament\Resources\Submissions\Schemas;

use App\Models\Question;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class SubmissionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Question Selection')
                    ->description('Choose the question this submission belongs to')
                    ->icon('heroicon-o-question-mark-circle')
                    ->schema([
                        Select::make('question_id')
                            ->relationship('question')
                            ->getOptionLabelFromRecordUsing(fn (Question $record) => $record->title)
                            ->placeholder('Select a question')
                            ->native(false)
                            ->preload()
                            ->searchable()
                            ->required(),
                    ])
                    ->columnSpanFull(),
                Section::make('Submitter Information')
                    ->description('Contributor details and view statistics')
                    ->icon('heroicon-o-user')
                    ->schema([
                        Select::make('user_id')
                            ->relationship('user', 'name')
                            ->placeholder('Select a user')
                            ->native(false)
                            ->preload()
                            ->searchable()
                            ->required(),
                        TextInput::make('section')
                            ->label('Section')
                            ->placeholder('e.g., A, B, C')
                            ->maxLength(255)
                            ->helperText('Optional: Specify the section if required by the exam type'),
                        TextInput::make('views')
                            ->label('View Count')
                            ->numeric()
                            ->default(0)
                            ->disabled()
                            ->dehydrated()
                            ->helperText('Automatically tracked'),
                    ])
                    ->columns(3)
                    ->columnSpanFull(),
                Section::make('PDF Document')
                    ->description('Upload the question paper in PDF format (max 10MB)')
                    ->icon('heroicon-o-document-arrow-up')
                    ->schema([
                        SpatieMediaLibraryFileUpload::make('pdf')
                            ->collection('pdf')
                            ->acceptedFileTypes(['application/pdf'])
                            ->maxSize(10240)
                            ->downloadable()
                            ->openable()
                            ->required(),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
