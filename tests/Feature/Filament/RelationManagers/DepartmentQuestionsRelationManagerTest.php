<?php

use App\Enums\QuestionStatus;
use App\Filament\Resources\Departments\Pages\EditDepartment;
use App\Filament\Resources\Departments\RelationManagers\QuestionsRelationManager;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;

use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('QuestionsRelationManager on Department', function () {
    it('can load the relation manager', function () {
        $department = Department::factory()->create();

        livewire(QuestionsRelationManager::class, [
            'ownerRecord' => $department,
            'pageClass' => EditDepartment::class,
        ])
            ->assertOk();
    });

    it('can list questions belonging to the department', function () {
        $department = Department::factory()->create();
        $course = Course::factory()->create(['department_id' => $department->id]);

        $questions = Question::factory()
            ->count(3)
            ->sequence(
                ['semester_id' => Semester::factory(), 'exam_type_id' => ExamType::factory()],
                ['semester_id' => Semester::factory(), 'exam_type_id' => ExamType::factory()],
                ['semester_id' => Semester::factory(), 'exam_type_id' => ExamType::factory()],
            )
            ->create([
                'department_id' => $department->id,
                'course_id' => $course->id,
            ]);

        $otherDepartment = Department::factory()->create();
        $otherCourse = Course::factory()->create(['department_id' => $otherDepartment->id]);
        $otherQuestions = Question::factory()
            ->count(2)
            ->sequence(
                ['semester_id' => Semester::factory(), 'exam_type_id' => ExamType::factory()],
                ['semester_id' => Semester::factory(), 'exam_type_id' => ExamType::factory()],
            )
            ->create([
                'department_id' => $otherDepartment->id,
                'course_id' => $otherCourse->id,
            ]);

        livewire(QuestionsRelationManager::class, [
            'ownerRecord' => $department,
            'pageClass' => EditDepartment::class,
        ])
            ->assertOk()
            ->assertCanSeeTableRecords($questions)
            ->assertCanNotSeeTableRecords($otherQuestions);
    });

    it('can filter questions by status', function () {
        $department = Department::factory()->create();
        $course = Course::factory()->create(['department_id' => $department->id]);

        $publishedQuestion = Question::factory()->create([
            'department_id' => $department->id,
            'course_id' => $course->id,
            'semester_id' => Semester::factory(),
            'exam_type_id' => ExamType::factory(),
            'status' => QuestionStatus::Published,
        ]);

        $pendingQuestion = Question::factory()->create([
            'department_id' => $department->id,
            'course_id' => $course->id,
            'semester_id' => Semester::factory(),
            'exam_type_id' => ExamType::factory(),
            'status' => QuestionStatus::PendingReview,
        ]);

        livewire(QuestionsRelationManager::class, [
            'ownerRecord' => $department,
            'pageClass' => EditDepartment::class,
        ])
            ->assertCanSeeTableRecords([$publishedQuestion, $pendingQuestion])
            ->filterTable('status', QuestionStatus::Published->value)
            ->assertCanSeeTableRecords([$publishedQuestion])
            ->assertCanNotSeeTableRecords([$pendingQuestion]);
    });

    it('displays the correct table columns', function () {
        $department = Department::factory()->create();

        livewire(QuestionsRelationManager::class, [
            'ownerRecord' => $department,
            'pageClass' => EditDepartment::class,
        ])
            ->assertTableColumnExists('status')
            ->assertTableColumnExists('course.name')
            ->assertTableColumnExists('semester.name')
            ->assertTableColumnExists('examType.name')
            ->assertTableColumnExists('submissions_count');
    });
});
