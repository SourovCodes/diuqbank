<?php

use App\Filament\Pages\Backups;
use App\Models\User;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Storage;

use function Pest\Livewire\livewire;

beforeEach(function () {
    Storage::fake('backups');
});

describe('Access Control', function () {
    it('denies access to unauthenticated users', function () {
        $this->get('/admin/backups')
            ->assertRedirect('/admin/login');
    });

    it('denies access to users without the required email', function () {
        $user = User::factory()->create(['email' => 'random@example.com']);

        $this->actingAs($user)
            ->get('/admin/backups')
            ->assertForbidden();
    });

    it('allows access to the authorized user', function () {
        $user = User::factory()->create(['email' => 'sourov2305101004@diu.edu.bd']);

        $this->actingAs($user);

        livewire(Backups::class)
            ->assertOk();
    });

    it('shows in navigation only for authorized users', function () {
        $authorizedUser = User::factory()->create(['email' => 'sourov2305101004@diu.edu.bd']);

        expect(Backups::canAccess())->toBeFalse();

        $this->actingAs($authorizedUser);

        expect(Backups::canAccess())->toBeTrue();
    });
});

describe('Page Configuration', function () {
    beforeEach(function () {
        $this->user = User::factory()->create(['email' => 'sourov2305101004@diu.edu.bd']);
        $this->actingAs($this->user);
    });

    it('can load the backups page', function () {
        livewire(Backups::class)
            ->assertOk();
    });

    it('has the correct title', function () {
        $page = new Backups;

        expect($page->getTitle())->toBe('Backups');
    });

    it('has the correct navigation label', function () {
        expect(Backups::getNavigationLabel())->toBe('Backups');
    });

    it('has the correct navigation icon', function () {
        expect(Backups::getNavigationIcon())->toBe(Heroicon::OutlinedCircleStack);
    });

    it('has a navigation badge color', function () {
        expect(Backups::getNavigationBadgeColor())->toBe('info');
    });

    it('has a navigation badge tooltip', function () {
        expect(Backups::getNavigationBadgeTooltip())->toBe('Total backups stored');
    });
});

describe('Table Display', function () {
    beforeEach(function () {
        $this->user = User::factory()->create(['email' => 'sourov2305101004@diu.edu.bd']);
        $this->actingAs($this->user);
    });

    it('renders the table component', function () {
        livewire(Backups::class)
            ->assertOk()
            ->assertSeeLivewire(Backups::class);
    });

    it('has table columns configured', function () {
        $page = livewire(Backups::class);

        expect($page->instance()->table(new \Filament\Tables\Table($page->instance()))
            ->getColumns())
            ->toHaveCount(4);
    });

    it('has empty state configured', function () {
        $page = livewire(Backups::class);
        $table = $page->instance()->table(new \Filament\Tables\Table($page->instance()));

        expect($table->getEmptyStateHeading())->toBe('No Backups Yet');
        expect($table->getEmptyStateDescription())->toBe('Create your first backup to protect your data.');
    });
});

describe('Header Actions', function () {
    beforeEach(function () {
        $this->user = User::factory()->create(['email' => 'sourov2305101004@diu.edu.bd']);
        $this->actingAs($this->user);
    });

    it('displays create backup action', function () {
        livewire(Backups::class)
            ->assertOk()
            ->assertActionVisible('create_backup');
    });

    it('displays refresh action', function () {
        livewire(Backups::class)
            ->assertOk()
            ->assertActionVisible('refresh');
    });

    it('can trigger refresh action', function () {
        livewire(Backups::class)
            ->callAction('refresh')
            ->assertOk();
    });

    it('can open create backup modal', function () {
        livewire(Backups::class)
            ->callAction('create_backup', data: ['option' => 'default'])
            ->assertNotified('Backup Complete');
    });

    it('can create database only backup', function () {
        livewire(Backups::class)
            ->callAction('create_backup', data: ['option' => 'only-db'])
            ->assertNotified('Backup Complete');
    });

    it('can create files only backup', function () {
        livewire(Backups::class)
            ->callAction('create_backup', data: ['option' => 'only-files'])
            ->assertNotified('Backup Complete');
    });
});
