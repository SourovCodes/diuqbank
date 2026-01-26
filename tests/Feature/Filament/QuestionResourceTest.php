<?php

use App\Filament\Resources\Questions\Pages\CreateQuestion;
use App\Filament\Resources\Questions\Pages\EditQuestion;
use App\Filament\Resources\Questions\Pages\ListQuestions;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;

use function Pest\Laravel\assertDatabaseHas;
use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('List Page', function () {
    it('can load the list page', function () {
        livewire(ListQuestions::class)
            ->assertOk();
    });

    it('can display questions in the table', function () {
        $questions = Question::factory()->count(3)->create();

        livewire(ListQuestions::class)
            ->assertCanSeeTableRecords($questions);
    });

    it('can filter questions by department', function () {
        $department = Department::factory()->create();
        $course = Course::factory()->for($department)->create();
        $questionsInDept = Question::factory()->count(2)->for($department)->for($course)->create();
        $otherQuestion = Question::factory()->create();

        livewire(ListQuestions::class)
            ->filterTable('department', $department->id)
            ->assertCanSeeTableRecords($questionsInDept)
            ->assertCanNotSeeTableRecords([$otherQuestion]);
    });

    it('can filter questions by semester', function () {
        $semester = Semester::factory()->create();
        $questionsInSemester = Question::factory()->count(2)->for($semester)->create();
        $otherQuestion = Question::factory()->create();

        livewire(ListQuestions::class)
            ->filterTable('semester', $semester->id)
            ->assertCanSeeTableRecords($questionsInSemester)
            ->assertCanNotSeeTableRecords([$otherQuestion]);
    });
});

describe('Create Page', function () {
    it('can load the create page', function () {
        livewire(CreateQuestion::class)
            ->assertOk();
    });

    it('can create a question', function () {
        $department = Department::factory()->create();
        $course = Course::factory()->for($department)->create();
        $semester = Semester::factory()->create();
        $examType = ExamType::factory()->create();

        livewire(CreateQuestion::class)
            ->fillForm([
                'department_id' => $department->id,
                'course_id' => $course->id,
                'semester_id' => $semester->id,
                'exam_type_id' => $examType->id,
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        assertDatabaseHas(Question::class, [
            'department_id' => $department->id,
            'course_id' => $course->id,
            'semester_id' => $semester->id,
            'exam_type_id' => $examType->id,
        ]);
    });

    it('validates required fields', function () {
        livewire(CreateQuestion::class)
            ->fillForm([
                'department_id' => null,
                'course_id' => null,
                'semester_id' => null,
                'exam_type_id' => null,
            ])
            ->call('create')
            ->assertHasFormErrors([
                'department_id' => 'required',
                'course_id' => 'required',
                'semester_id' => 'required',
                'exam_type_id' => 'required',
            ]);
    });
});

describe('Edit Page', function () {
    it('can load the edit page', function () {
        $question = Question::factory()->create();

        livewire(EditQuestion::class, ['record' => $question->getRouteKey()])
            ->assertOk();
    });

    it('can update a question', function () {
        $question = Question::factory()->create();
        $newSemester = Semester::factory()->create();
        $newExamType = ExamType::factory()->create();

        livewire(EditQuestion::class, ['record' => $question->getRouteKey()])
            ->fillForm([
                'semester_id' => $newSemester->id,
                'exam_type_id' => $newExamType->id,
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $question->refresh();
        expect($question->semester_id)->toBe($newSemester->id);
        expect($question->exam_type_id)->toBe($newExamType->id);
    });

    it('can delete a question', function () {
        $question = Question::factory()->create();

        livewire(EditQuestion::class, ['record' => $question->getRouteKey()])
            ->callAction('delete');

        expect(Question::find($question->id))->toBeNull();
    });
});
