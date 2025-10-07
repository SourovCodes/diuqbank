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
        $departments = [
            ['name' => 'Computer Science and Engineering', 'short_name' => 'CSE'],
            ['name' => 'Electrical and Electronic Engineering', 'short_name' => 'EEE'],
            ['name' => 'Civil Engineering', 'short_name' => 'CE'],
            ['name' => 'Mechanical Engineering', 'short_name' => 'ME'],
            ['name' => 'Business Administration', 'short_name' => 'BBA'],
            ['name' => 'English Language and Literature', 'short_name' => 'ELL'],
            ['name' => 'Mathematics', 'short_name' => 'MATH'],
            ['name' => 'Physics', 'short_name' => 'PHY'],
            ['name' => 'Chemistry', 'short_name' => 'CHEM'],
            ['name' => 'Economics', 'short_name' => 'ECON'],
            ['name' => 'Psychology', 'short_name' => 'PSY'],
            ['name' => 'Architecture', 'short_name' => 'ARCH'],
            ['name' => 'Law', 'short_name' => 'LAW'],
            ['name' => 'Medicine', 'short_name' => 'MED'],
            ['name' => 'Pharmacy', 'short_name' => 'PHARM'],
        ];

        $department = $this->faker->randomElement($departments);
        
        return [
            'name' => $department['name'],
            'short_name' => $department['short_name'],
        ];
    }
}
