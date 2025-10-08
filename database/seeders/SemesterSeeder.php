<?php

namespace Database\Seeders;

use App\Models\Semester;
use Illuminate\Database\Seeder;

class SemesterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $semesters = [
            // Historical semesters (2020-2023)
            'Spring 2020',
            'Summer 2020',
            'Fall 2020',
            'Spring 2021',
            'Summer 2021',
            'Fall 2021',
            'Spring 2022',
            'Summer 2022',
            'Fall 2022',
            'Spring 2023',
            'Summer 2023',
            'Fall 2023',

            // Current and recent semesters (2024-2025)
            'Spring 2024',
            'Summer 2024',
            'Fall 2024',
            'Spring 2025',
            'Summer 2025',
            'Fall 2025',

            // Future semesters (2026-2028)
            'Spring 2026',
            'Summer 2026',
            'Fall 2026',
            'Spring 2027',
            'Summer 2027',
            'Fall 2027',
            'Spring 2028',
            'Summer 2028',
            'Fall 2028',
        ];

        foreach ($semesters as $semesterName) {
            Semester::firstOrCreate([
                'name' => $semesterName,
            ]);
        }
    }
}
