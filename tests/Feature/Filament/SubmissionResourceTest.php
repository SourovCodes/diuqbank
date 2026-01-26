<?php

use App\Filament\Resources\Submissions\Pages\CreateSubmission;
use App\Filament\Resources\Submissions\Pages\EditSubmission;
use App\Filament\Resources\Submissions\Pages\ListSubmissions;
use App\Models\Question;
use App\Models\Submission;
use App\Models\User;

use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    Storage::fake('public');
});

describe('List Page', function () {
    it('can load the list page', function () {
        livewire(ListSubmissions::class)
            ->assertOk();
    });

    it('can display submissions in the table', function () {
        $submissions = Submission::factory()->count(3)->create();

        livewire(ListSubmissions::class)
            ->assertCanSeeTableRecords($submissions);
    });

    it('can filter submissions by question', function () {
        $question = Question::factory()->create();
        $submissionsForQuestion = Submission::factory()->count(2)->for($question)->create();
        $otherSubmission = Submission::factory()->create();

        livewire(ListSubmissions::class)
            ->filterTable('question', $question->id)
            ->assertCanSeeTableRecords($submissionsForQuestion)
            ->assertCanNotSeeTableRecords([$otherSubmission]);
    });

    it('can filter submissions by user', function () {
        $user = User::factory()->create();
        $submissionsForUser = Submission::factory()->count(2)->for($user)->create();
        $otherSubmission = Submission::factory()->create();

        livewire(ListSubmissions::class)
            ->filterTable('user', $user->id)
            ->assertCanSeeTableRecords($submissionsForUser)
            ->assertCanNotSeeTableRecords([$otherSubmission]);
    });
});

describe('Create Page', function () {
    it('can load the create page', function () {
        livewire(CreateSubmission::class)
            ->assertOk();
    });

    it('validates required fields', function () {
        livewire(CreateSubmission::class)
            ->fillForm([
                'question_id' => null,
                'user_id' => null,
            ])
            ->call('create')
            ->assertHasFormErrors([
                'question_id' => 'required',
                'user_id' => 'required',
            ]);
    });
});

describe('Edit Page', function () {
    it('can load the edit page', function () {
        $submission = Submission::factory()->create();

        livewire(EditSubmission::class, ['record' => $submission->getRouteKey()])
            ->assertOk();
    });

    it('can delete a submission', function () {
        $submission = Submission::factory()->create();

        livewire(EditSubmission::class, ['record' => $submission->getRouteKey()])
            ->callAction('delete');

        expect(Submission::find($submission->id))->toBeNull();
    });
});
