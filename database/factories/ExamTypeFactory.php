<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExamType>
 */
class ExamTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $examTypes = [
            ['name' => 'Final', 'requires_section' => false],
            ['name' => 'Mid', 'requires_section' => false],
            ['name' => 'Quiz', 'requires_section' => true],
            ['name' => 'Lab Final', 'requires_section' => true],
        ];

        $examType = $this->faker->randomElement($examTypes);

        return [
            'name' => $examType['name'],
            'requires_section' => $examType['requires_section'],
        ];
    }
}
