<?php

use App\Enums\QuestionStatus;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->constrained('users');
            $table->foreignIdFor(Department::class)->constrained('departments');
            $table->foreignIdFor(Course::class)->constrained('courses');
            $table->foreignIdFor(Semester::class)->constrained('semesters');
            $table->foreignIdFor(ExamType::class)->constrained('exam_types');
            $table->string('section')->nullable();
            $table->enum('status', QuestionStatus::cases())->default(QuestionStatus::PENDING_REVIEW);
            $table->unsignedBigInteger('view_count')->default(0);
            $table->string('pdf_key');
            $table->unsignedInteger('pdf_size');
            $table->boolean('is_watermarked')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
