<?php

namespace App\Models;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Set;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class CourseName extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',

    ];

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(Question::class);
    }

    public static function getForm(): array
    {
        return [
            TextInput::make('name')
                ->placeholder('Data Structure')
                ->required()
                ->columnSpanFull()
                ->unique(ignoreRecord: true)
                ->maxLength(255)
                ->live(onBlur: true)
                ->afterStateUpdated(fn(Set $set, ?string $state) => $set('slug', Str::slug($state))),

            TextInput::make('slug')
                ->placeholder('data-structure')
                ->readOnly()
                ->label('Keyword For Url')
                ->helperText('Cannot contain spaces or special characters.')
                ->rules(['required', 'regex:/^[a-zA-Z0-9-]+$/'])
                ->required()
                ->unique(ignoreRecord: true)
                ->maxLength(255)
                ->columnSpanFull(),
        ];
    }
}
