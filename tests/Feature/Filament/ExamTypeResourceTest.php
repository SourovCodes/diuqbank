<?php

use App\Filament\Resources\ExamTypes\Pages\CreateExamType;
use App\Filament\Resources\ExamTypes\Pages\EditExamType;
use App\Filament\Resources\ExamTypes\Pages\ListExamTypes;
use App\Models\ExamType;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Livewire\Livewire;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Filament::setCurrentPanel('admin');
});

it('lists exam types in the table', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    $examTypes = ExamType::factory()
        ->sequence(
            ['name' => 'Exam Type 1', 'requires_section' => true],
            ['name' => 'Exam Type 2', 'requires_section' => false],
            ['name' => 'Exam Type 3', 'requires_section' => true],
        )
        ->count(3)
        ->create();

    actingAs($admin);

    Livewire::test(ListExamTypes::class)
        ->assertOk()
        ->assertCanSeeTableRecords($examTypes);
});

it('creates an exam type from the form', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    /** @var ExamType $examTypeData */
    $examTypeData = ExamType::factory()->make();

    actingAs($admin);

    Livewire::test(CreateExamType::class)
        ->assertOk()
        ->fillForm([
            'name' => Str::lower($examTypeData->name),
            'requires_section' => ! $examTypeData->requires_section,
        ])
        ->call('create')
        ->assertNotified()
        ->assertRedirect();

    assertDatabaseHas(ExamType::class, [
        'name' => Str::headline($examTypeData->name),
        'requires_section' => ! $examTypeData->requires_section,
    ]);
});

it('updates an exam type from the form', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    /** @var ExamType $examType */
    $examType = ExamType::factory()->create(['requires_section' => false]);
    /** @var ExamType $newExamTypeData */
    $newExamTypeData = ExamType::factory()->make(['requires_section' => true]);

    actingAs($admin);

    Livewire::test(EditExamType::class, ['record' => $examType->getKey()])
        ->assertOk()
        ->fillForm([
            'name' => Str::lower($newExamTypeData->name),
            'requires_section' => $newExamTypeData->requires_section,
        ])
        ->call('save')
        ->assertNotified();

    assertDatabaseHas(ExamType::class, [
        'id' => $examType->id,
        'name' => Str::headline($newExamTypeData->name),
        'requires_section' => $newExamTypeData->requires_section,
    ]);
});
