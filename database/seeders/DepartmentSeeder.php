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
            ['name' => 'Industrial and Production Engineering', 'short_name' => 'IPE'],
            ['name' => 'Textile Engineering', 'short_name' => 'TE'],
            ['name' => 'Architecture', 'short_name' => 'ARCH'],
            ['name' => 'Urban and Regional Planning', 'short_name' => 'URP'],
            ['name' => 'Business Administration', 'short_name' => 'BBA'],
            ['name' => 'Economics', 'short_name' => 'ECON'],
            ['name' => 'Accounting and Information Systems', 'short_name' => 'AIS'],
            ['name' => 'Management Information Systems', 'short_name' => 'MIS'],
            ['name' => 'Finance', 'short_name' => 'FIN'],
            ['name' => 'Marketing', 'short_name' => 'MKT'],
            ['name' => 'Management', 'short_name' => 'MGT'],
            ['name' => 'English Language and Literature', 'short_name' => 'ELL'],
            ['name' => 'Bangla', 'short_name' => 'BAN'],
            ['name' => 'History', 'short_name' => 'HIST'],
            ['name' => 'Philosophy', 'short_name' => 'PHIL'],
            ['name' => 'Islamic Studies', 'short_name' => 'IS'],
            ['name' => 'Arabic', 'short_name' => 'ARA'],
            ['name' => 'Persian Language and Literature', 'short_name' => 'PER'],
            ['name' => 'Urdu', 'short_name' => 'URD'],
            ['name' => 'Mathematics', 'short_name' => 'MATH'],
            ['name' => 'Physics', 'short_name' => 'PHY'],
            ['name' => 'Chemistry', 'short_name' => 'CHEM'],
            ['name' => 'Statistics', 'short_name' => 'STAT'],
            ['name' => 'Geography and Environment', 'short_name' => 'GE'],
            ['name' => 'Geology', 'short_name' => 'GEOL'],
            ['name' => 'Psychology', 'short_name' => 'PSY'],
            ['name' => 'Sociology', 'short_name' => 'SOC'],
            ['name' => 'Anthropology', 'short_name' => 'ANTH'],
            ['name' => 'Political Science', 'short_name' => 'POLS'],
            ['name' => 'International Relations', 'short_name' => 'IR'],
            ['name' => 'Public Administration', 'short_name' => 'PA'],
            ['name' => 'Law', 'short_name' => 'LAW'],
            ['name' => 'Medicine', 'short_name' => 'MED'],
            ['name' => 'Dentistry', 'short_name' => 'DENT'],
            ['name' => 'Pharmacy', 'short_name' => 'PHARM'],
            ['name' => 'Nursing', 'short_name' => 'NURS'],
            ['name' => 'Physiotherapy', 'short_name' => 'PHYSIO'],
            ['name' => 'Veterinary Science', 'short_name' => 'VET'],
            ['name' => 'Agricultural Economics', 'short_name' => 'AGECO'],
            ['name' => 'Agronomy', 'short_name' => 'AGRO'],
            ['name' => 'Soil Science', 'short_name' => 'SOIL'],
            ['name' => 'Horticulture', 'short_name' => 'HORT'],
            ['name' => 'Fisheries', 'short_name' => 'FISH'],
            ['name' => 'Animal Husbandry', 'short_name' => 'AH'],
            ['name' => 'Forestry', 'short_name' => 'FOR'],
            ['name' => 'Environmental Science', 'short_name' => 'ES'],
            ['name' => 'Botany', 'short_name' => 'BOT'],
            ['name' => 'Zoology', 'short_name' => 'ZOO'],
            ['name' => 'Biochemistry and Molecular Biology', 'short_name' => 'BMB'],
            ['name' => 'Microbiology', 'short_name' => 'MICRO'],
            ['name' => 'Genetic Engineering and Biotechnology', 'short_name' => 'GEB'],
            ['name' => 'Fine Arts', 'short_name' => 'FA'],
            ['name' => 'Music', 'short_name' => 'MUS'],
            ['name' => 'Dance', 'short_name' => 'DANCE'],
            ['name' => 'Theatre and Performance Studies', 'short_name' => 'TPS'],
            ['name' => 'Film and Television', 'short_name' => 'FTV'],
            ['name' => 'Journalism and Media Studies', 'short_name' => 'JMS'],
            ['name' => 'Mass Communication and Journalism', 'short_name' => 'MCJ'],
            ['name' => 'Library and Information Science', 'short_name' => 'LIS'],
        ];

        foreach ($departments as $department) {
            Department::firstOrCreate($department);
        }
    }
}
