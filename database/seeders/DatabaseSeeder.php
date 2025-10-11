<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('Starting database seeding...');

        // Seed base data first
        $this->call([
            DepartmentSeeder::class,
            CourseSeeder::class,
            SemesterSeeder::class,
            ExamTypeSeeder::class,
        ]);

        $this->command->info('Creating 200 users...');

        // Create 200 users
        User::factory(200)->create();

        $this->command->info('200 users created successfully!');

        // Seed questions after user creation (100 questions per user)
        $this->call([
            QuestionSeeder::class,
        ]);

        $this->command->info('Database seeding completed successfully!');
    }
}
