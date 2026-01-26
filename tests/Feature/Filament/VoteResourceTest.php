<?php

use App\Filament\Resources\Votes\Pages\CreateVote;
use App\Filament\Resources\Votes\Pages\EditVote;
use App\Filament\Resources\Votes\Pages\ListVotes;
use App\Models\Submission;
use App\Models\User;
use App\Models\Vote;

use function Pest\Laravel\assertDatabaseHas;
use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('List Page', function () {
    it('can load the list page', function () {
        livewire(ListVotes::class)
            ->assertOk();
    });

    it('can display votes in the table', function () {
        $votes = Vote::factory()->count(3)->create();

        livewire(ListVotes::class)
            ->assertCanSeeTableRecords($votes);
    });

    it('can filter votes by user', function () {
        $user = User::factory()->create();
        $votesForUser = Vote::factory()->count(2)->for($user)->create();
        $otherVote = Vote::factory()->create();

        livewire(ListVotes::class)
            ->filterTable('user', $user->id)
            ->assertCanSeeTableRecords($votesForUser)
            ->assertCanNotSeeTableRecords([$otherVote]);
    });

    it('can filter votes by type', function () {
        $upvotes = Vote::factory()->count(2)->upvote()->create();
        $downvotes = Vote::factory()->count(2)->downvote()->create();

        livewire(ListVotes::class)
            ->filterTable('value', 1)
            ->assertCanSeeTableRecords($upvotes)
            ->assertCanNotSeeTableRecords($downvotes);
    });
});

describe('Create Page', function () {
    it('can load the create page', function () {
        livewire(CreateVote::class)
            ->assertOk();
    });

    it('can create an upvote', function () {
        $submission = Submission::factory()->create();
        $user = User::factory()->create();

        livewire(CreateVote::class)
            ->fillForm([
                'submission_id' => $submission->id,
                'user_id' => $user->id,
                'value' => 1,
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        assertDatabaseHas(Vote::class, [
            'submission_id' => $submission->id,
            'user_id' => $user->id,
            'value' => 1,
        ]);
    });

    it('can create a downvote', function () {
        $submission = Submission::factory()->create();
        $user = User::factory()->create();

        livewire(CreateVote::class)
            ->fillForm([
                'submission_id' => $submission->id,
                'user_id' => $user->id,
                'value' => -1,
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        assertDatabaseHas(Vote::class, [
            'submission_id' => $submission->id,
            'user_id' => $user->id,
            'value' => -1,
        ]);
    });

    it('validates required fields', function () {
        livewire(CreateVote::class)
            ->fillForm([
                'submission_id' => null,
                'user_id' => null,
                'value' => null,
            ])
            ->call('create')
            ->assertHasFormErrors([
                'submission_id' => 'required',
                'user_id' => 'required',
                'value' => 'required',
            ]);
    });
});

describe('Edit Page', function () {
    it('can load the edit page', function () {
        $vote = Vote::factory()->create();

        livewire(EditVote::class, ['record' => $vote->getRouteKey()])
            ->assertOk();
    });

    it('can change vote from upvote to downvote', function () {
        $vote = Vote::factory()->upvote()->create();

        livewire(EditVote::class, ['record' => $vote->getRouteKey()])
            ->fillForm([
                'value' => -1,
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $vote->refresh();
        expect($vote->value)->toBe(-1);
    });

    it('can delete a vote', function () {
        $vote = Vote::factory()->create();

        livewire(EditVote::class, ['record' => $vote->getRouteKey()])
            ->callAction('delete');

        expect(Vote::find($vote->id))->toBeNull();
    });
});
