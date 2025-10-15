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
            'Spring 20',
            'Summer 20',
            'Fall 20',
            'Spring 21',
            'Summer 21',
            'Fall 21',
            'Spring 22',
            'Summer 22',
            'Fall 22',
            'Spring 23',
            'Summer 23',
            'Fall 23',
            'Spring 24',
            'Summer 24',
            'Fall 24',
            'Spring 25',
            'Summer 25',
            'Fall 25',
            'Spring 26',
            'Summer 26',
        ];

        foreach ($semesters as $semesterName) {
            Semester::firstOrCreate([
                'name' => $semesterName,
            ]);
        }
    }
}
