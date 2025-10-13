<?php

namespace App\Console\Commands;

use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ImportQuestionsFromOldApi extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:import-questions-from-old-api';

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
        $questions = Http::get('https://diuqbank.com/api/questions')->json();
        // sort question by created_at, oldest first
        usort($questions, function ($a, $b) {
            return strtotime($a['created_at']) - strtotime($b['created_at']);
        });
        $this->info('Found '.count($questions).' questions');

        foreach ($questions as $question) {
            $this->info('Importing question: '.$question['id']);

            $department = Department::updateOrCreate([
                'name' => $question['department']['name'],
            ], [
                'name' => $question['department']['name'],
                'short_name' => $question['department']['short_name'],
            ]);

            $course = $department->courses()->updateOrCreate([
                'name' => $question['course']['name'],
            ], [
                'name' => $question['course']['name'],
            ]);

            $semester = Semester::updateOrCreate([
                'name' => $question['semester']['name'],
            ], [
                'name' => $question['semester']['name'],
            ]);

            $examType = ExamType::updateOrCreate([
                'name' => $question['exam_type']['name'],
            ], [
                'name' => $question['exam_type']['name'],
                'requires_section'=> $question['exam_type']['requires_section'],
            ]);

            $user = User::updateOrCreate([
                'email' => $question['user']['email'],
            ], [
                'name' => $question['user']['name'],
                'email' => $question['user']['email'],
                'username' => $question['user']['username'],
                'student_id' => $question['user']['student_id'],
            ]);

             if($question['user']['image'] && !$user->hasMedia('profile_picture') ) {
                $user->addMediaFromUrl($question['user']['image'])->toMediaCollection('profile_picture');
            }
            
            $status = $question['status'];
            $under_review_reason = $status === "pending_review" ? "duplicate" : null;
            $duplicate_reason =  $status === "pending_review"  ? $question['user_reports'][0]['details'] : null;

            $newQuestion = Question::updateOrCreate([
                'user_id' => $user->id,
                'department_id' => $department->id,
                'course_id' => $course->id,
                'semester_id' => $semester->id,
                'exam_type_id' => $examType->id,
            ],[
                'user_id' => $user->id,
                'department_id' => $department->id,
                'course_id' => $course->id,
                'semester_id' => $semester->id,
                'exam_type_id' => $examType->id,
                'section' =>  $question['section'],
                'status' =>  $status,
                'under_review_reason' =>  $under_review_reason,
                'duplicate_reason' =>  $duplicate_reason,
                'view_count' => $question['view_count'],
                'created_at' => $question['created_at'],
                'updated_at' => $question['updated_at'],
            ]);
            if(!$newQuestion->hasMedia('pdf') ) {
                $newQuestion->addMediaFromUrl("https://r2.diuqbank.com/".$question['pdf_key'])->toMediaCollection('pdf');
            }
        }
    }
}
