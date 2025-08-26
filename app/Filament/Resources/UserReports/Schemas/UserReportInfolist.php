<?php

namespace App\Filament\Resources\UserReports\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class UserReportInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('user.name'),
                TextEntry::make('question.id'),
                TextEntry::make('type'),
                IconEntry::make('reviewed')
                    ->boolean(),
                TextEntry::make('created_at')
                    ->dateTime(),
                TextEntry::make('updated_at')
                    ->dateTime(),
                Section::make('question')->schema([
                    TextEntry::make('question.department.short_name')
                        ->badge()
                        ->label("Department Name"),
                    TextEntry::make('question.course.name')
                        ->badge()
                        ->label("Course Name"),

                    TextEntry::make('question.semester.name')
                        ->badge()
                        ->label("Semester"),
                    TextEntry::make('question.examType.name')
                        ->badge()
                        ->label("Exam Type"),
                    TextEntry::make('question.pdf_url')
                        ->columnSpanFull()
                        ->openUrlInNewTab()
                        ->label("PDF URL"),

                ])
                    ->columnSpanFull()
                    ->columns(2)
                    ->collapsible(),
            ]);
    }
}
