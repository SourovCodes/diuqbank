<?php

namespace App\Filament\Resources\Votes\Schemas;

use App\Models\Submission;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class VoteForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Vote Information')
                    ->description('Record a vote on a submission')
                    ->icon('heroicon-o-hand-thumb-up')
                    ->schema([
                        Select::make('submission_id')
                            ->relationship('submission')
                            ->getOptionLabelFromRecordUsing(fn (Submission $record) => "Submission #{$record->id} by {$record->user->name}")
                            ->placeholder('Select a submission')
                            ->native(false)
                            ->preload()
                            ->searchable()
                            ->required(),
                        Select::make('user_id')
                            ->relationship('user', 'name')
                            ->placeholder('Select a voter')
                            ->native(false)
                            ->preload()
                            ->searchable()
                            ->required(),
                        Select::make('value')
                            ->label('Vote Type')
                            ->placeholder('Select vote type')
                            ->native(false)
                            ->options([
                                1 => '👍 Upvote',
                                -1 => '👎 Downvote',
                            ])
                            ->required(),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),
            ]);
    }
}
