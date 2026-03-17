<?php

namespace App\Filament\Resources\Questions\RelationManagers;

use App\Models\Submission;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class SubmissionsRelationManager extends RelationManager
{
    protected static string $relationship = 'submissions';

    protected static ?string $title = 'PDF Submissions';

    protected static \BackedEnum|string|null $icon = Heroicon::DocumentArrowUp;

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Submission Details')
                    ->description('Add or edit a PDF submission for this question')
                    ->icon('heroicon-o-document-arrow-up')
                    ->schema([
                        Select::make('user_id')
                            ->relationship('user', 'name')
                            ->label('Submitted By')
                            ->placeholder('Select a user')
                            ->native(false)
                            ->preload()
                            ->searchable()
                            ->required()
                            ->columnSpanFull(),
                        SpatieMediaLibraryFileUpload::make('pdf')
                            ->collection('pdf')
                            ->label('PDF Document')
                            ->acceptedFileTypes(['application/pdf'])
                            ->maxSize(10240)
                            ->downloadable()
                            ->openable()
                            ->required()
                            ->columnSpanFull(),
                        TextInput::make('views')
                            ->label('View Count')
                            ->numeric()
                            ->default(0)
                            ->disabled()
                            ->dehydrated()
                            ->helperText('Automatically tracked when users view this submission'),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('id')
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),
                TextColumn::make('user.name')
                    ->label('Submitted By')
                    ->searchable()
                    ->sortable()
                    ->icon('heroicon-o-user'),
                TextColumn::make('views')
                    ->label('Views')
                    ->sortable()
                    ->icon('heroicon-o-eye')
                    ->badge()
                    ->color('gray'),
                TextColumn::make('vote_score')
                    ->label('Vote Score')
                    ->getStateUsing(fn (Submission $record) => $record->vote_score)
                    ->badge()
                    ->color(fn (int $state): string => match (true) {
                        $state > 0 => 'success',
                        $state < 0 => 'danger',
                        default => 'gray',
                    })
                    ->icon(fn (int $state): string => match (true) {
                        $state > 0 => 'heroicon-o-arrow-trending-up',
                        $state < 0 => 'heroicon-o-arrow-trending-down',
                        default => 'heroicon-o-minus',
                    })
                    ->sortable(query: fn ($query, $direction) => $query
                        ->withSum('votes', 'value')
                        ->orderBy('votes_sum_value', $direction)),
                TextColumn::make('votes_count')
                    ->label('Total Votes')
                    ->counts('votes')
                    ->badge()
                    ->color('info')
                    ->icon('heroicon-o-hand-thumb-up'),
                TextColumn::make('created_at')
                    ->label('Uploaded')
                    ->dateTime('M j, Y')
                    ->sortable()
                    ->toggleable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                //
            ])
            ->headerActions([
                CreateAction::make()
                    ->label('Add Submission')
                    ->icon('heroicon-o-plus'),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('No submissions yet')
            ->emptyStateDescription('Upload the first PDF submission for this question.')
            ->emptyStateIcon('heroicon-o-document-arrow-up');
    }
}
