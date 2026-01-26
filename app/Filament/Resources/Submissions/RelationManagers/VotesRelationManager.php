<?php

namespace App\Filament\Resources\Submissions\RelationManagers;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class VotesRelationManager extends RelationManager
{
    protected static string $relationship = 'votes';

    protected static ?string $title = 'Votes';

    protected static \BackedEnum|string|null $icon = Heroicon::HandThumbUp;

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Vote Details')
                    ->description('Record a vote for this submission')
                    ->icon('heroicon-o-hand-thumb-up')
                    ->schema([
                        Select::make('user_id')
                            ->relationship('user', 'name')
                            ->label('Voter')
                            ->placeholder('Select a user')
                            ->native(false)
                            ->preload()
                            ->searchable()
                            ->required(),
                        Select::make('value')
                            ->label('Vote Type')
                            ->placeholder('Select vote type')
                            ->native(false)
                            ->options([
                                1 => '👍 Upvote (+1)',
                                -1 => '👎 Downvote (-1)',
                            ])
                            ->required(),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('value')
            ->columns([
                TextColumn::make('user.name')
                    ->label('Voter')
                    ->searchable()
                    ->sortable()
                    ->icon('heroicon-o-user'),
                TextColumn::make('value')
                    ->label('Vote')
                    ->badge()
                    ->formatStateUsing(fn (int $state): string => $state === 1 ? '👍 Upvote' : '👎 Downvote')
                    ->color(fn (int $state): string => $state === 1 ? 'success' : 'danger')
                    ->sortable(),
                TextColumn::make('created_at')
                    ->label('Voted At')
                    ->dateTime('M j, Y g:i A')
                    ->sortable()
                    ->toggleable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('value')
                    ->label('Vote Type')
                    ->options([
                        1 => 'Upvotes',
                        -1 => 'Downvotes',
                    ]),
            ])
            ->headerActions([
                CreateAction::make()
                    ->label('Add Vote')
                    ->icon('heroicon-o-plus'),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('No votes yet')
            ->emptyStateDescription('This submission has not received any votes.')
            ->emptyStateIcon('heroicon-o-hand-thumb-up');
    }
}
