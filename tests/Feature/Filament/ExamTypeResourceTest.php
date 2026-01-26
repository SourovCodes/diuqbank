<?php

use App\Filament\Resources\ExamTypes\Pages\CreateExamType;
use App\Filament\Resources\ExamTypes\Pages\EditExamType;
use App\Filament\Resources\ExamTypes\Pages\ListExamTypes;
use App\Models\ExamType;
use App\Models\User;

use function Pest\Laravel\assertDatabaseHas;
use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('List Page', function () {
    it('can load the list page', function () {
        livewire(ListExamTypes::class)
            ->assertOk();
    });

    it('can display exam types in the table', function () {
        $examTypes = ExamType::factory()->count(3)->create();

        livewire(ListExamTypes::class)
            ->assertCanSeeTableRecords($examTypes);
    });

    it('can search exam types by name', function () {
        $examType = ExamType::factory()->create(['name' => 'Midterm Examination']);
        ExamType::factory()->create(['name' => 'Final Examination']);

        livewire(ListExamTypes::class)
            ->searchTable('Midterm')
            ->assertCanSeeTableRecords([$examType])
            ->assertCountTableRecords(1);
    });
});

describe('Create Page', function () {
    it('can load the create page', function () {
        livewire(CreateExamType::class)
            ->assertOk();
    });

    it('can create an exam type', function () {
        livewire(CreateExamType::class)
            ->fillForm([
                'name' => 'Quiz',
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        assertDatabaseHas(ExamType::class, [
            'name' => 'Quiz',
        ]);
    });

    it('validates required fields', function () {
        livewire(CreateExamType::class)
            ->fillForm([
                'name' => null,
            ])
            ->call('create')
            ->assertHasFormErrors(['name' => 'required']);
    });
});

describe('Edit Page', function () {
    it('can load the edit page', function () {
        $examType = ExamType::factory()->create();

        livewire(EditExamType::class, ['record' => $examType->getRouteKey()])
            ->assertOk();
    });

    it('can update an exam type', function () {
        $examType = ExamType::factory()->create();

        livewire(EditExamType::class, ['record' => $examType->getRouteKey()])
            ->fillForm([
                'name' => 'Lab Exam',
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $examType->refresh();
        expect($examType->name)->toBe('Lab Exam');
    });

    it('can delete an exam type', function () {
        $examType = ExamType::factory()->create();

        livewire(EditExamType::class, ['record' => $examType->getRouteKey()])
            ->callAction('delete');

        expect(ExamType::find($examType->id))->toBeNull();
    });
});
