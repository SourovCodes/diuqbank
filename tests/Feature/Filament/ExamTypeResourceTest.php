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

    /** @var \App\Models\User $user */
    $user = User::factory()->createOne();

    actingAs($user);
});

it('lists exam types with their attributes', function (): void {
    $examTypes = ExamType::factory()
        ->count(3)
        ->sequence(
            ['name' => 'Midterm', 'requires_section' => false],
            ['name' => 'Quiz', 'requires_section' => true],
            ['name' => 'Lab Final', 'requires_section' => true],
        )
        ->create();

    Livewire::test(ListExamTypes::class)
        ->assertOk()
        ->assertCanSeeTableRecords($examTypes);
});

it('filters exam types by section requirement', function (): void {
    $requiresSection = ExamType::factory()->create([
        'name' => 'Quiz',
        'requires_section' => true,
    ]);

    $noSection = ExamType::factory()->create([
        'name' => 'Final',
        'requires_section' => false,
    ]);

    Livewire::test(ListExamTypes::class)
        ->filterTable('requires_section', true)
        ->assertCanSeeTableRecords([$requiresSection])
        ->assertCanNotSeeTableRecords([$noSection]);
});

it('creates an exam type from the create page', function (): void {
    $rawName = 'pop quiz';

    Livewire::test(CreateExamType::class)
        ->assertOk()
        ->fillForm([
            'name' => $rawName,
            'requires_section' => true,
        ])
        ->call('create')
        ->assertNotified()
        ->assertRedirect();

    assertDatabaseHas(ExamType::class, [
        'name' => Str::headline(str($rawName)->squish()->toString()),
        'requires_section' => true,
    ]);
});

it('updates an exam type from the edit page', function (): void {
    $examType = ExamType::factory()->create([
        'name' => 'Final',
        'requires_section' => false,
    ]);

    Livewire::test(EditExamType::class, [
        'record' => $examType->getKey(),
    ])
        ->assertOk()
        ->fillForm([
            'name' => 'Comprehensive Final',
            'requires_section' => true,
        ])
        ->call('save')
        ->assertNotified();

    assertDatabaseHas(ExamType::class, [
        'id' => $examType->getKey(),
        'name' => Str::headline(str('Comprehensive Final')->squish()->toString()),
        'requires_section' => true,
    ]);
});
