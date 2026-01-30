<?php

namespace App\Console\Commands;

use App\Enums\QuestionStatus;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\Submission;
use App\Models\User;
use Http;
use Illuminate\Console\Command;

class ImportFromApi extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:import-from-api {--limit= : Limit the number of questions to import}';

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
        $questions = Http::get('https://diuqbank.com/api/migration/questions')->json('data');
        $this->info('Fetched '.count($questions).' questions from API.');

        $limit = $this->option('limit');
        if ($limit) {
            $questions = array_slice($questions, 0, (int) $limit);
            $this->info('Limiting import to '.$limit.' questions.');
        }

        foreach ($questions as $question) {
            // Process each question as needed
            $this->info('Processing Question ID: '.$question['id']);
            $department = Department::firstOrCreate(
                [
                    'name' => $question['department']['name'],
                    'short_name' => $question['department']['short_name'],
                ],
                [
                    'name' => $question['department']['name'],
                    'short_name' => $question['department']['short_name'],
                ],

            );
            $course = Course::firstOrCreate(
                [
                    'name' => $question['course']['name'],
                    'department_id' => $department->id,
                ],
                [
                    'name' => $question['course']['name'],
                    'department_id' => $department->id,
                ],
            );
            $semester = Semester::firstOrCreate(
                [
                    'name' => $question['semester']['name'],
                ],
                [
                    'name' => $question['semester']['name'],
                ],
            );
            $examType = ExamType::firstOrCreate(
                [
                    'name' => $question['exam_type']['name'],
                ],
                [
                    'name' => $question['exam_type']['name'],
                    'requires_section' => $question['exam_type']['requires_section'],
                ],
            );
            // $question['user']['email'] = 'sourov2305101004@diu.edu.bd';

            $uploader = User::where('email', $question['user']['email'])->first();
            if (! $uploader) {
                $uploader = User::create([
                    'name' => $question['user']['name'],
                    'email' => $question['user']['email'],
                    'password' => bcrypt(\Illuminate\Support\Str::random(32)),
                    'username' => $question['user']['username'],
                    'student_id' => $question['user']['student_id'],
                ]);
                $uploader->timestamps = false;
                $uploader->created_at = \Carbon\Carbon::parse($question['user']['created_at']);
                $uploader->updated_at = \Carbon\Carbon::parse($question['user']['created_at']);
                $uploader->save();
            }

            $newquestion = Question::where('department_id', $department->id)
                ->where('course_id', $course->id)
                ->where('semester_id', $semester->id)
                ->where('exam_type_id', $examType->id)
                ->first();
            if (! $newquestion) {
                $newquestion = Question::create([
                    'department_id' => $department->id,
                    'course_id' => $course->id,
                    'semester_id' => $semester->id,
                    'exam_type_id' => $examType->id,
                ]);
                $newquestion->timestamps = false;
                $newquestion->created_at = \Carbon\Carbon::parse($question['created_at']);
                $newquestion->updated_at = \Carbon\Carbon::parse($question['created_at']);
                $newquestion->save();
            }

            $submission = Submission::create([
                'question_id' => $newquestion->id,
                'user_id' => $uploader->id,
            ]);
            $submission->timestamps = false;
            $submission->created_at = \Carbon\Carbon::parse($question['created_at']);
            $submission->updated_at = \Carbon\Carbon::parse($question['created_at']);
            $submission->save();

            // Attach PDF from media.original_url if present
            if (! empty($question['media']['original_url'])) {
                try {
                    $submission->addMediaFromUrl($question['media']['original_url'])
                        ->toMediaCollection('pdf');
                    $this->info('PDF attached from URL: '.$question['media']['original_url']);
                } catch (\Exception $e) {
                    $this->error('Failed to attach PDF from URL: '.$question['media']['original_url'].' - '.$e->getMessage());
                }
            }

            if ($question['status'] === 'published' && $newquestion->status != QuestionStatus::Published) {
                $newquestion->status = QuestionStatus::Published;
                $newquestion->save();
            }

            // Add your import logic here
        }
    }
}
