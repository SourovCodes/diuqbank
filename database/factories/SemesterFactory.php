<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Semester>
 */
class SemesterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $seasons = ['Spring', 'Summer', 'Fall'];
        $years = range(20, 30);

        $season = $this->faker->randomElement($seasons);
        $year = $this->faker->randomElement($years);

        return [
            'name' => $season.' '.$year,
        ];
    }
}
