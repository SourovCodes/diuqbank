<?php

namespace Database\Seeders;

use App\Models\ExamType;
use Illuminate\Database\Seeder;

class ExamTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $examTypes = [
            [
                'name' => 'Final',
                'requires_section' => false,
            ],
            [
                'name' => 'Mid',
                'requires_section' => false,
            ],
            [
                'name' => 'Quiz',
                'requires_section' => true,
            ],
            [
                'name' => 'Lab Final',
                'requires_section' => true,
            ],
        ];

        foreach ($examTypes as $examType) {
            ExamType::firstOrCreate($examType);
        }
    }
}
