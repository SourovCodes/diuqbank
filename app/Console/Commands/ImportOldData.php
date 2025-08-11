<?php

namespace App\Console\Commands;

use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ImportOldData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:import-old-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $oldQuestions = Http::get('https://diuqbank.com/api/questions')->json('data');
        $this->info('Importing old questions...');


        $single = 0;
        $multiple = 0;
        foreach ($oldQuestions as $oldQuestion) {
//            $this->info("Imported question ID: {$oldQuestion['id']}, Title: {$oldQuestion['title']}");

            if (count($oldQuestion['departments']) > 1) {
                $multiple++;
                continue;
            }
            if (count($oldQuestion['semesters']) > 1) {
                $multiple++;
                continue;
            }

            if (count($oldQuestion['examTypes']) > 1) {
                $multiple++;
                continue;
            }
            if (count($oldQuestion['courses']) > 1) {
                $multiple++;
                continue;
            }
            $single++;
            continue;
//            $department = Department::updateOrCreate([
//                'name' => $oldQuestion['departments'][0]['name'],
//            ], [
//                'name' => $oldQuestion['departments'][0]['name'],
//                'short_name' => $oldQuestion['departments'][0]['name'],
//            ]);
//
//
//            $course = Course::updateOrCreate([
//                'name' => $oldQuestion['courses'][0]['name'],
//            ], [
//                'name' => $oldQuestion['courses'][0]['name'],
//                'user_id' => 1,
//            ]);
//
//            $semester = Semester::updateOrCreate([
//                'name' => $oldQuestion['semesters'][0]['name'],
//            ],
//                [
//                    'name' => $oldQuestion['semesters'][0]['name'],
//                    'user_id' => 1,
//                ]);
//
//            $examType = ExamType::updateOrCreate([
//                'name' => $oldQuestion['examTypes'][0]['name'],
//            ], [
//                'name' => $oldQuestion['examTypes'][0]['name'],
//                'user_id' => 1,
//            ]);
//
//
//            $question = Question::updateOrCreate([
//                'id' => $oldQuestion['id'],
//            ], [
//                'department_id' => $department->id,
//                'course_id' => $course->id,
//                'semester_id' => $semester->id,
//                'exam_type_id' => $examType->id,
//                'user_id' => 1,
//                'view_count' => 0,
//            ]);
//            $this->info('Importing new questions...');


        }
        $this->info("Single: {$single}");
        $this->info("Multiple: {$multiple}");

    }
}
