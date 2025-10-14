<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            ['name' => 'Computer Science and Engineering', 'short_name' => 'CSE'],
            ['name' => 'Electrical and Electronic Engineering', 'short_name' => 'EEE'],
            ['name' => 'Civil Engineering', 'short_name' => 'CE'],
            ['name' => 'Mechanical Engineering', 'short_name' => 'ME'],
            ['name' => 'Chemical Engineering', 'short_name' => 'ChE'],
            ['name' => 'Business Administration', 'short_name' => 'BBA'],
            ['name' => 'Economics', 'short_name' => 'ECON'],
            ['name' => 'Accounting and Information Systems', 'short_name' => 'AIS'],
            ['name' => 'Management Information Systems', 'short_name' => 'MIS'],
            ['name' => 'Finance', 'short_name' => 'FIN'],
            ['name' => 'Marketing', 'short_name' => 'MKT'],
            ['name' => 'Mathematics', 'short_name' => 'MATH'],
            ['name' => 'Physics', 'short_name' => 'PHY'],
            ['name' => 'Chemistry', 'short_name' => 'CHEM'],
            ['name' => 'Statistics', 'short_name' => 'STAT'],
            ['name' => 'English Language and Literature', 'short_name' => 'ELL'],
            ['name' => 'Law', 'short_name' => 'LAW'],
            ['name' => 'Pharmacy', 'short_name' => 'PHARM'],
            ['name' => 'Architecture', 'short_name' => 'ARCH'],
            ['name' => 'Environmental Science', 'short_name' => 'ES'],
        ];

        foreach ($departments as $department) {
            Department::firstOrCreate($department);
        }
    }
}
