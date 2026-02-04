<?php

use App\Enums\QuestionStatus;
use App\Filament\Resources\ExamTypes\Pages\EditExamType;
use App\Filament\Resources\ExamTypes\RelationManagers\QuestionsRelationManager;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\User;

use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('QuestionsRelationManager on ExamType', function () {
    it('can render on edit page', function () {
        $examType = ExamType::factory()->create();

        livewire(EditExamType::class, ['record' => $examType->getRouteKey()])
            ->assertSeeLivewire(QuestionsRelationManager::class);
    });

    it('can list questions belonging to the exam type', function () {
        $examType = ExamType::factory()->create();

        $questions = Question::factory()
            ->count(3)
            ->create(['exam_type_id' => $examType->id]);

        $otherExamType = ExamType::factory()->create();
        $otherQuestions = Question::factory()
            ->count(2)
            ->create(['exam_type_id' => $otherExamType->id]);

        livewire(QuestionsRelationManager::class, [
            'ownerRecord' => $examType,
            'pageClass' => EditExamType::class,
        ])
            ->assertOk()
            ->assertCanSeeTableRecords($questions)
            ->assertCanNotSeeTableRecords($otherQuestions);
    });

    it('can filter questions by status', function () {
        $examType = ExamType::factory()->create();

        $publishedQuestion = Question::factory()->create([
            'exam_type_id' => $examType->id,
            'status' => QuestionStatus::Published,
        ]);

        $pendingQuestion = Question::factory()->create([
            'exam_type_id' => $examType->id,
            'status' => QuestionStatus::PendingReview,
        ]);

        livewire(QuestionsRelationManager::class, [
            'ownerRecord' => $examType,
            'pageClass' => EditExamType::class,
        ])
            ->assertCanSeeTableRecords([$publishedQuestion, $pendingQuestion])
            ->filterTable('status', QuestionStatus::Published->value)
            ->assertCanSeeTableRecords([$publishedQuestion])
            ->assertCanNotSeeTableRecords([$pendingQuestion]);
    });

    it('displays the correct table columns', function () {
        $examType = ExamType::factory()->create();

        livewire(QuestionsRelationManager::class, [
            'ownerRecord' => $examType,
            'pageClass' => EditExamType::class,
        ])
            ->assertTableColumnExists('status')
            ->assertTableColumnExists('department.short_name')
            ->assertTableColumnExists('course.name')
            ->assertTableColumnExists('semester.name')
            ->assertTableColumnExists('submissions_count');
    });
});
