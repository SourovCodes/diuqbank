<?php

namespace App\Console\Commands;

use App\Enums\QuestionStatus;
use App\Enums\UserReportType;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;
use App\Models\UserReport;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ImportQuestions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:import-questions';

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
        $oldQuestions = collect(Http::get('https://diuqbank.com/api/questions')->json('data'))
            ->sortBy('createdAt')
            ->values()
            ->all();
        $this->info('Found '.count($oldQuestions).' questions to import.');

        foreach ($oldQuestions as $question) {

            //            $this->info("Importing question: " . $question['createdAt']);
            //            continue;

            if (count($question['courses']) == 1 && count($question['departments']) == 1 && count($question['semesters']) == 1 && count($question['examTypes']) == 1) {

                $user = User::updateOrCreate(
                    ['email' => $question['uploader']['email']],
                    [
                        'name' => $question['uploader']['name'],
                        'email' => $question['uploader']['email'],
                        'username' => $question['uploader']['username'],
                        'student_id' => $question['uploader']['studentId'],
                        'image' => $question['uploader']['image'],
                        'created_at' => $question['uploader']['createdAt'],
                        'updated_at' => $question['uploader']['updatedAt'],
                    ]
                );

                $department = Department::updateOrCreate([
                    'name' => $question['departments'][0]['name'],
                ], [
                    'name' => $question['departments'][0]['name'],
                    'short_name' => $question['departments'][0]['name'],
                ]);

                $course = Course::updateOrCreate([
                    'name' => $question['courses'][0]['name'],
                    'department_id' => $department->id,
                ], [
                    'name' => $question['courses'][0]['name'],
                    'department_id' => $department->id,
                ]);

                $semester = Semester::updateOrCreate([
                    'name' => $question['semesters'][0]['name'],
                ], [
                    'name' => $question['semesters'][0]['name'],
                ]);
                $examType = ExamType::updateOrCreate([
                    'name' => $question['examTypes'][0]['name'],
                ], [
                    'name' => $question['examTypes'][0]['name'],
                    'requires_section' => false,
                ]);

                $existingQuestion = Question::where('department_id', $department->id)
                    ->where('course_id', $course->id)
                    ->where('semester_id', $semester->id)
                    ->where('exam_type_id', $examType->id)
                    ->where('user_id', '!=', $user->id)
                    ->first();

                $newQuestion = Question::updateOrCreate([
                    'user_id' => $user->id,
                    'department_id' => $department->id,
                    'course_id' => $course->id,
                    'semester_id' => $semester->id,
                    'exam_type_id' => $examType->id,
                ], [
                    'user_id' => $user->id,
                    'department_id' => $department->id,
                    'course_id' => $course->id,
                    'semester_id' => $semester->id,
                    'exam_type_id' => $examType->id,
                    'pdf_key' => $question['pdf']['pdfKey'],
                    'pdf_size' => $question['pdf']['pdfSize'],
                    'status' => $existingQuestion ? QuestionStatus::PENDING_REVIEW : QuestionStatus::PUBLISHED,
                ]);

                if ($existingQuestion) {
                    UserReport::updateOrCreate([
                        'user_id' => $user->id,
                        'question_id' => $newQuestion->id,
                        'type' => UserReportType::DUPLICATE_ALLOW_REQUEST,
                    ], [
                        'user_id' => $user->id,
                        'question_id' => $newQuestion->id,
                        'type' => UserReportType::DUPLICATE_ALLOW_REQUEST,
                        'details' => $question['duplicateReason'] ?? 'No reason provided',

                    ]);
                }

            }

        }
    }
}
