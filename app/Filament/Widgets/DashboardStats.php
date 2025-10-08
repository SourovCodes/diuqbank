<?php

namespace App\Filament\Widgets;

use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class DashboardStats extends StatsOverviewWidget
{
    protected ?string $pollingInterval = '30s';

    protected function getStats(): array
    {
        $questions = Question::query()->count();
        $departments = Department::query()->count();
        $courses = Course::query()->count();
        $semesters = Semester::query()->count();
        $examTypes = ExamType::query()->count();
        $users = User::query()->count();

        return [
            Stat::make('Questions', number_format($questions))
                ->icon('heroicon-o-document-duplicate')
                ->description('Published exam questions'),
            Stat::make('Departments', number_format($departments))
                ->icon('heroicon-o-building-library')
                ->description('Active academic units'),
            Stat::make('Courses', number_format($courses))
                ->icon('heroicon-o-book-open')
                ->description('Available course records'),
            Stat::make('Semesters', number_format($semesters))
                ->icon('heroicon-o-calendar-days')
                ->description('Configured terms'),
            Stat::make('Exam Types', number_format($examTypes))
                ->icon('heroicon-o-clipboard-document-check')
                ->description('Assessment formats'),
            Stat::make('Users', number_format($users))
                ->icon('heroicon-o-users')
                ->description('Registered contributors'),
        ];
    }
}
