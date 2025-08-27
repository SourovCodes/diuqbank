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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

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
        $oldQuestions = collect(Http::get('http://test.diuqbank.com/questions.json')->json('data'))
            ->sortBy('createdAt')
            ->values()
            ->all();
        $this->info('Found '.count($oldQuestions).' questions to import.');

        $successCount = 0;
        $failedCount = 0;
        $skippedCount = 0;

        foreach ($oldQuestions as $question) {

            //            $this->info("Importing question: " . $question['createdAt']);
            //            continue;

            if (count($question['courses']) == 1 && count($question['departments']) == 1 && count($question['semesters']) == 1 && count($question['examTypes']) == 1) {

                $oldPdfUrl = $question['pdf']['pdfUrl'];
                
                // Try to download the PDF from the old URL
                try {
                    $this->info("Downloading PDF from: $oldPdfUrl");
                    $pdfResponse = Http::timeout(30)->get($oldPdfUrl);
                    
                    if (!$pdfResponse->successful() || empty($pdfResponse->body())) {
                        $this->error("Failed to download PDF - URL: $oldPdfUrl - Status: " . $pdfResponse->status());
                        $failedCount++;
                        continue;
                    }
                    
                    // Generate a unique key for the PDF in S3
                    $uuid = Str::uuid();
                    $finalKey = "questions/$uuid.pdf";
                    
                    // Upload the PDF to S3
                    Storage::disk('s3')->put($finalKey, $pdfResponse->body());
                    Storage::disk('s3')->setVisibility($finalKey, 'public');
                    
                    // Calculate the file size
                    $pdfSize = Storage::disk('s3')->size($finalKey);
                    
                    $this->info("Successfully uploaded PDF to S3: $finalKey (Size: $pdfSize bytes)");
                    
                } catch (\Exception $e) {
                    $this->error("Exception downloading/uploading PDF - URL: $oldPdfUrl - Error: " . $e->getMessage());
                    $failedCount++;
                    continue;
                }
             

                // Handle user with preserved timestamps
                $existingUser = User::where('email', $question['uploader']['email'])->first();
                if ($existingUser) {
                    // Update existing user but preserve original timestamps
                    DB::table('users')
                        ->where('email', $question['uploader']['email'])
                        ->update([
                            'name' => $question['uploader']['name'],
                            'username' => $question['uploader']['username'],
                            'student_id' => $question['uploader']['studentId'],
                            'image' => $question['uploader']['image'],
                            'updated_at' => Carbon::parse($question['uploader']['updatedAt'])->format('Y-m-d H:i:s'),
                        ]);
                    $user = $existingUser->fresh();
                } else {
                    // Insert new user with original timestamps
                    $userId = DB::table('users')->insertGetId([
                        'name' => $question['uploader']['name'],
                        'email' => $question['uploader']['email'],
                        'username' => $question['uploader']['username'],
                        'student_id' => $question['uploader']['studentId'],
                        'image' => $question['uploader']['image'],
                        'created_at' => Carbon::parse($question['uploader']['createdAt'])->format('Y-m-d H:i:s'),
                        'updated_at' => Carbon::parse($question['uploader']['updatedAt'])->format('Y-m-d H:i:s'),
                    ]);
                    $user = User::find($userId);
                }

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

                $oldExamType = $question['examTypes'][0]['name'];
                $needSection = (bool)($oldExamType==='Quiz' || $oldExamType === 'Lab Final');
                $examType = ExamType::updateOrCreate([
                    'name' => $oldExamType,
                ], [
                    'name' => $oldExamType,
                    'requires_section' => $needSection,
                ]);

                $existingQuestion = Question::where('department_id', $department->id)
                    ->where('course_id', $course->id)
                    ->where('semester_id', $semester->id)
                    ->where('exam_type_id', $examType->id)
                    ->where('user_id', '!=', $user->id)
                    ->first();

                // Determine the status based on conditions
                $status = QuestionStatus::PUBLISHED;
                if ($needSection) {
                    $status = QuestionStatus::NEED_FIX;
                } elseif ($existingQuestion) {
                    $status = QuestionStatus::PENDING_REVIEW;
                }

                // Handle question with preserved timestamps
                $existingQuestionForUpdate = Question::where([
                    'user_id' => $user->id,
                    'department_id' => $department->id,
                    'course_id' => $course->id,
                    'semester_id' => $semester->id,
                    'exam_type_id' => $examType->id,
                ])->first();
                
                if ($existingQuestionForUpdate) {
                    // Update existing question but preserve original timestamps
                    DB::table('questions')
                        ->where('id', $existingQuestionForUpdate->id)
                        ->update([
                            'pdf_key' => $finalKey,
                            'pdf_size' => $pdfSize,
                            'status' => $status,
                            'is_watermarked' => false,
                            'updated_at' => Carbon::parse($question['updatedAt'])->format('Y-m-d H:i:s'),
                        ]);
                    $newQuestion = $existingQuestionForUpdate->fresh();
                } else {
                    // Insert new question with original timestamps
                    $questionId = DB::table('questions')->insertGetId([
                        'user_id' => $user->id,
                        'department_id' => $department->id,
                        'course_id' => $course->id,
                        'semester_id' => $semester->id,
                        'exam_type_id' => $examType->id,
                        'pdf_key' => $finalKey,
                        'pdf_size' => $pdfSize,
                        'status' => $status,
                        'is_watermarked' => false,
                        'created_at' => Carbon::parse($question['createdAt'])->format('Y-m-d H:i:s'),
                        'updated_at' => Carbon::parse($question['updatedAt'])->format('Y-m-d H:i:s'),
                    ]);
                    $newQuestion = Question::find($questionId);
                }
                
                $successCount++;

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

            } else {
                $this->warn("Skipping question due to multiple or missing relationships (courses: " . count($question['courses']) . ", departments: " . count($question['departments']) . ", semesters: " . count($question['semesters']) . ", examTypes: " . count($question['examTypes']) . ")");
                $skippedCount++;
            }

        }
        
        // Display final statistics
        $this->info("Import completed!");
        $this->info("Successfully imported: $successCount questions");
        $this->info("Failed to download/upload PDFs: $failedCount questions");
        $this->info("Skipped due to invalid relationships: $skippedCount questions");
        $total = $successCount + $failedCount + $skippedCount;
        $this->info("Total processed: $total questions");
    }
}
