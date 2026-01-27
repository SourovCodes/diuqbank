<?php

namespace Database\Seeders;

use App\Enums\QuestionStatus;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\Submission;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);

        // Create regular users
        $users = User::factory(10)->create();
        $allUsers = $users->push($admin);

        // Create Departments
        $departments = collect([
            ['name' => 'Computer Science & Engineering', 'short_name' => 'CSE'],
            ['name' => 'Electrical & Electronic Engineering', 'short_name' => 'EEE'],
            ['name' => 'Business Administration', 'short_name' => 'BBA'],
            ['name' => 'English', 'short_name' => 'ENG'],
            ['name' => 'Pharmacy', 'short_name' => 'PHR'],
            ['name' => 'Civil Engineering', 'short_name' => 'CE'],
        ])->map(fn ($dept) => Department::create($dept));

        // Create Courses for each department
        $coursesByDept = [
            'CSE' => [
                'Introduction to Programming',
                'Data Structures',
                'Algorithms',
                'Database Management Systems',
                'Operating Systems',
                'Computer Networks',
                'Software Engineering',
                'Web Development',
                'Machine Learning',
                'Artificial Intelligence',
            ],
            'EEE' => [
                'Circuit Analysis',
                'Electronics',
                'Digital Logic Design',
                'Signals and Systems',
                'Power Systems',
                'Control Systems',
                'Microprocessors',
                'Communication Systems',
            ],
            'BBA' => [
                'Principles of Management',
                'Financial Accounting',
                'Marketing Management',
                'Human Resource Management',
                'Business Communication',
                'Organizational Behavior',
                'Strategic Management',
            ],
            'ENG' => [
                'Introduction to Literature',
                'English Composition',
                'Creative Writing',
                'Linguistics',
                'British Literature',
                'American Literature',
            ],
            'PHR' => [
                'Pharmaceutical Chemistry',
                'Pharmacology',
                'Pharmaceutics',
                'Pharmacognosy',
                'Clinical Pharmacy',
            ],
            'CE' => [
                'Engineering Mechanics',
                'Structural Analysis',
                'Geotechnical Engineering',
                'Transportation Engineering',
                'Environmental Engineering',
            ],
        ];

        $departments->each(function ($dept) use ($coursesByDept) {
            $courses = $coursesByDept[$dept->short_name] ?? [];
            foreach ($courses as $courseName) {
                Course::create([
                    'department_id' => $dept->id,
                    'name' => $courseName,
                ]);
            }
        });

        // Create Semesters
        $semesters = collect([
            'Spring 2024',
            'Summer 2024',
            'Fall 2024',
            'Spring 2025',
            'Summer 2025',
            'Fall 2025',
            'Spring 2026',
        ])->map(fn ($name) => Semester::create(['name' => $name]));

        // Create Exam Types
        $examTypes = collect([
            'Midterm Exam',
            'Final Exam',
            'Quiz',
            'Assignment',
            'Lab Exam',
            'Viva',
        ])->map(fn ($name) => ExamType::create(['name' => $name]));

        // Create Questions and Submissions
        $courses = Course::all();
        $createdCombinations = [];

        for ($i = 0; $i < 1000; $i++) {
            $course = $courses->random();
            $semester = $semesters->random();
            $examType = $examTypes->random();

            $combination = "{$course->department_id}-{$course->id}-{$semester->id}-{$examType->id}";

            if (in_array($combination, $createdCombinations)) {
                continue;
            }

            $createdCombinations[] = $combination;

            // 80% published, 15% pending, 5% rejected
            $rand = rand(1, 100);
            $status = match (true) {
                $rand <= 80 => QuestionStatus::Published,
                $rand <= 95 => QuestionStatus::PendingReview,
                default => QuestionStatus::Rejected,
            };

            $question = Question::create([
                'department_id' => $course->department_id,
                'course_id' => $course->id,
                'semester_id' => $semester->id,
                'exam_type_id' => $examType->id,
                'status' => $status,
            ]);

            // Create 1-3 submissions per question
            $submissionCount = rand(1, 3);
            for ($j = 0; $j < $submissionCount; $j++) {
                $submission = Submission::create([
                    'question_id' => $question->id,
                    'user_id' => $allUsers->random()->id,
                    'views' => rand(0, 500),
                ]);

                // Create votes for submissions
                $voterCount = rand(0, 8);
                $voters = $allUsers->random(min($voterCount, $allUsers->count()));
                foreach ($voters as $voter) {
                    Vote::create([
                        'submission_id' => $submission->id,
                        'user_id' => $voter->id,
                        'value' => rand(0, 10) > 3 ? 1 : -1, // 70% upvotes
                    ]);
                }
            }
        }
    }
}
