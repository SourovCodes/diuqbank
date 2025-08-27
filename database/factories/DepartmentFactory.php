<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Department>
 */
class DepartmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generate 2-4 words for a department name (e.g., "Computer Science", "Applied Mathematics")
        $wordCount = fake()->numberBetween(2, 4);
        $words = fake()->words($wordCount);
        $name = implode(' ', array_map(fn ($w) => ucfirst($w), $words));
        // Acronym built from first letter of each word
        $short = strtoupper(implode('', array_map(fn ($w) => substr($w, 0, 1), $words)));

        return [
            'name' => $name,
            'short_name' => $short,
        ];
    }
}
