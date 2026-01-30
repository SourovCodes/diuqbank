<?php

use App\Filament\Pages\Backups;
use App\Models\User;

use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->authorizedUser = User::factory()->create([
        'email' => 'sourov2305101004@diu.edu.bd',
    ]);

    $this->unauthorizedUser = User::factory()->create([
        'email' => 'other@example.com',
    ]);
});

describe('page access', function () {
    it('allows authorized user to access the backups page', function () {
        $this->actingAs($this->authorizedUser);

        expect(Backups::canAccess())->toBeTrue();
    });

    it('denies access to unauthorized users', function () {
        $this->actingAs($this->unauthorizedUser);

        expect(Backups::canAccess())->toBeFalse();
    });

    it('denies access to guests', function () {
        expect(Backups::canAccess())->toBeFalse();
    });
});

describe('page rendering', function () {
    it('renders the backups page for authorized user', function () {
        $this->actingAs($this->authorizedUser);

        livewire(Backups::class)
            ->assertSuccessful();
    });

    it('displays the correct page title', function () {
        $page = new Backups;

        expect($page->getTitle())->toBe('Backups');
    });

    it('has correct navigation label', function () {
        expect(Backups::getNavigationLabel())->toBe('Backups');
    });

    it('belongs to System navigation group', function () {
        expect(Backups::getNavigationGroup())->toBe('System');
    });
});

describe('header actions', function () {
    it('has refresh action', function () {
        $this->actingAs($this->authorizedUser);

        livewire(Backups::class)
            ->assertActionExists('refresh');
    });

    it('has create backup action', function () {
        $this->actingAs($this->authorizedUser);

        livewire(Backups::class)
            ->assertActionExists('create_backup');
    });
});

describe('navigation', function () {
    it('has navigation badge showing backup count or null', function () {
        $badge = Backups::getNavigationBadge();

        if ($badge !== null) {
            expect($badge)->toBeString();
        } else {
            expect($badge)->toBeNull();
        }
    });

    it('has info color for navigation badge', function () {
        expect(Backups::getNavigationBadgeColor())->toBe('info');
    });

    it('has tooltip for navigation badge', function () {
        expect(Backups::getNavigationBadgeTooltip())->toBe('Total backups stored');
    });
});
