<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $departmentCourses = [
            'CSE' => [
                'Programming Fundamentals',
                'Data Structures and Algorithms',
                'Database Management Systems',
                'Computer Networks',
                'Software Engineering',
                'Operating Systems',
                'Web Development',
                'Artificial Intelligence',
                'Machine Learning',
                'Computer Graphics',
            ],
            'EEE' => [
                'Circuit Analysis',
                'Digital Electronics',
                'Power Systems',
                'Control Systems',
                'Electromagnetic Theory',
                'Microprocessors',
                'Communications Engineering',
                'Power Electronics',
                'Signal Processing',
                'Renewable Energy Systems',
            ],
            'CE' => [
                'Structural Analysis',
                'Concrete Technology',
                'Fluid Mechanics',
                'Geotechnical Engineering',
                'Transportation Engineering',
                'Environmental Engineering',
                'Construction Management',
                'Highway Engineering',
                'Water Resources Engineering',
                'Earthquake Engineering',
            ],
            'BBA' => [
                'Principles of Management',
                'Financial Accounting',
                'Marketing Management',
                'Human Resource Management',
                'Business Statistics',
                'Organizational Behavior',
                'Operations Management',
                'Strategic Management',
                'International Business',
                'Entrepreneurship',
            ],
            'MATH' => [
                'Calculus I',
                'Linear Algebra',
                'Differential Equations',
                'Real Analysis',
                'Abstract Algebra',
                'Probability Theory',
                'Statistics',
                'Number Theory',
                'Topology',
                'Mathematical Modeling',
            ],
        ];

        // Get a random department or create one if none exists
        $department = Department::inRandomOrder()->first() ?? Department::factory()->create();

        // Get courses for this department's short name, or use generic courses
        $courses = $departmentCourses[$department->short_name] ?? [
            'Introduction to '.$department->name,
            'Advanced '.$department->name,
            'Research Methods in '.$department->name,
            'Seminar in '.$department->name,
            'Special Topics in '.$department->name,
        ];

        return [
            'department_id' => $department->id,
            'name' => $this->faker->randomElement($courses),
        ];
    }
}
