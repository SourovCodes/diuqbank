<?php

namespace App\Models;

use Filament\Forms\Set;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Filament\Forms\Components\TextInput;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Semester extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'full_name',
        'slug',

    ];

    public function questions()
    {
        return $this->belongsToMany(Question::class);
    }

    public static function getForm(): array
    {
        return [
            TextInput::make('name')
                ->placeholder('Spring 24')
                ->required()
                ->columnSpanFull()
                ->unique(ignoreRecord: true)
                ->maxLength(255)
                ->live(onBlur: true)
                ->afterStateUpdated(fn(Set $set, ?string $state) => $set('slug', Str::slug($state))),

            TextInput::make('slug')
                ->placeholder('spring-24')
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
