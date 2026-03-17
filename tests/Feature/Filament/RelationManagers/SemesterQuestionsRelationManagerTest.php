<?php

use App\Enums\QuestionStatus;
use App\Filament\Resources\Semesters\Pages\EditSemester;
use App\Filament\Resources\Semesters\RelationManagers\QuestionsRelationManager;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;
use Filament\Actions\Testing\TestAction;

use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('QuestionsRelationManager on Semester', function () {
    it('can render on edit page', function () {
        $semester = Semester::factory()->create();

        livewire(EditSemester::class, ['record' => $semester->getRouteKey()])
            ->assertSeeLivewire(QuestionsRelationManager::class);
    });

    it('can list questions belonging to the semester', function () {
        $semester = Semester::factory()->create();

        $questions = Question::factory()
            ->count(3)
            ->create(['semester_id' => $semester->id]);

        $otherSemester = Semester::factory()->create();
        $otherQuestions = Question::factory()
            ->count(2)
            ->create(['semester_id' => $otherSemester->id]);

        livewire(QuestionsRelationManager::class, [
            'ownerRecord' => $semester,
            'pageClass' => EditSemester::class,
        ])
            ->assertOk()
            ->assertCanSeeTableRecords($questions)
            ->assertCanNotSeeTableRecords($otherQuestions);
    });

    it('can filter questions by status', function () {
        $semester = Semester::factory()->create();

        $publishedQuestion = Question::factory()->create([
            'semester_id' => $semester->id,
            'status' => QuestionStatus::Published,
        ]);

        $pendingQuestion = Question::factory()->create([
            'semester_id' => $semester->id,
            'status' => QuestionStatus::PendingReview,
        ]);

        livewire(QuestionsRelationManager::class, [
            'ownerRecord' => $semester,
            'pageClass' => EditSemester::class,
        ])
            ->assertCanSeeTableRecords([$publishedQuestion, $pendingQuestion])
            ->filterTable('status', QuestionStatus::Published->value)
            ->assertCanSeeTableRecords([$publishedQuestion])
            ->assertCanNotSeeTableRecords([$pendingQuestion]);
    });

    it('displays the correct table columns', function () {
        $semester = Semester::factory()->create();

        livewire(QuestionsRelationManager::class, [
            'ownerRecord' => $semester,
            'pageClass' => EditSemester::class,
        ])
            ->assertTableColumnExists('status')
            ->assertTableColumnExists('department.short_name')
            ->assertTableColumnExists('course.name')
            ->assertTableColumnExists('examType.name')
            ->assertTableColumnExists('submissions_count');
    });

    it('can move questions to another semester', function () {
        $semester = Semester::factory()->create(['name' => 'Spring 2024']);
        $newSemester = Semester::factory()->create(['name' => 'Fall 2024']);

        $questions = Question::factory()->count(2)->create([
            'semester_id' => $semester->id,
        ]);

        livewire(QuestionsRelationManager::class, [
            'ownerRecord' => $semester,
            'pageClass' => EditSemester::class,
        ])
            ->selectTableRecords($questions->pluck('id')->toArray())
            ->callAction(TestAction::make('moveToSemester')->table()->bulk(), [
                'semester_id' => $newSemester->id,
            ])
            ->assertNotified();

        $questions->each(function ($question) use ($newSemester) {
            $question->refresh();
            expect($question->semester_id)->toBe($newSemester->id);
        });
    });
});
