<?php

namespace App\Filament\Resources\Departments\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class DepartmentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->maxLength(50)
                    ->unique()
                    ->required(),
                TextInput::make('short_name')
                    ->unique()
                    ->maxLength(10)
                    ->required(),
            ]);
    }
}
