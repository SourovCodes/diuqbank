<?php

use App\Enums\QuestionStatus;
use App\Filament\Resources\Courses\Pages\EditCourse;
use App\Filament\Resources\Courses\RelationManagers\QuestionsRelationManager;
use App\Models\Course;
use App\Models\Question;
use App\Models\User;

use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('QuestionsRelationManager on Course', function () {
    it('can render on edit page', function () {
        $course = Course::factory()->create();

        livewire(EditCourse::class, ['record' => $course->getRouteKey()])
            ->assertSeeLivewire(QuestionsRelationManager::class);
    });

    it('can list questions belonging to the course', function () {
        $course = Course::factory()->create();

        $questions = Question::factory()
            ->count(3)
            ->create([
                'department_id' => $course->department_id,
                'course_id' => $course->id,
            ]);

        $otherCourse = Course::factory()->create();
        $otherQuestions = Question::factory()
            ->count(2)
            ->create([
                'department_id' => $otherCourse->department_id,
                'course_id' => $otherCourse->id,
            ]);

        livewire(QuestionsRelationManager::class, [
            'ownerRecord' => $course,
            'pageClass' => EditCourse::class,
        ])
            ->assertOk()
            ->assertCanSeeTableRecords($questions)
            ->assertCanNotSeeTableRecords($otherQuestions);
    });

    it('can filter questions by status', function () {
        $course = Course::factory()->create();

        $publishedQuestion = Question::factory()->create([
            'department_id' => $course->department_id,
            'course_id' => $course->id,
            'status' => QuestionStatus::Published,
        ]);

        $pendingQuestion = Question::factory()->create([
            'department_id' => $course->department_id,
            'course_id' => $course->id,
            'status' => QuestionStatus::PendingReview,
        ]);

        livewire(QuestionsRelationManager::class, [
            'ownerRecord' => $course,
            'pageClass' => EditCourse::class,
        ])
            ->assertCanSeeTableRecords([$publishedQuestion, $pendingQuestion])
            ->filterTable('status', QuestionStatus::Published->value)
            ->assertCanSeeTableRecords([$publishedQuestion])
            ->assertCanNotSeeTableRecords([$pendingQuestion]);
    });

    it('displays the correct table columns', function () {
        $course = Course::factory()->create();

        livewire(QuestionsRelationManager::class, [
            'ownerRecord' => $course,
            'pageClass' => EditCourse::class,
        ])
            ->assertTableColumnExists('status')
            ->assertTableColumnExists('department.short_name')
            ->assertTableColumnExists('semester.name')
            ->assertTableColumnExists('examType.name')
            ->assertTableColumnExists('submissions_count');
    });
});
