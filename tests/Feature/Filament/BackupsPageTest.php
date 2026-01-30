<?php

use App\Filament\Pages\Backups;
use App\Filament\Widgets\BackupDestinationsWidget;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

use function Pest\Livewire\livewire;

beforeEach(function () {
    Storage::fake('backups');
    Artisan::shouldReceive('call')->andReturn(0)->byDefault();
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
        expect(Backups::getNavigationIcon())->toBe('heroicon-o-circle-stack');
    });

    it('has a navigation badge color', function () {
        expect(Backups::getNavigationBadgeColor())->toBe('info');
    });

    it('has a navigation badge tooltip', function () {
        expect(Backups::getNavigationBadgeTooltip())->toBe('Total backups stored');
    });
});

describe('Destinations Widget', function () {
    beforeEach(function () {
        $this->user = User::factory()->create(['email' => 'sourov2305101004@diu.edu.bd']);
        $this->actingAs($this->user);
    });

    it('includes BackupDestinationsWidget in header widgets', function () {
        $page = new Backups;
        $method = new ReflectionMethod($page, 'getHeaderWidgets');
        $widgets = $method->invoke($page);

        expect($widgets)->toContain(BackupDestinationsWidget::class);
    });

    it('can render the destinations widget', function () {
        livewire(BackupDestinationsWidget::class)
            ->assertOk();
    });

    it('destinations widget has polling enabled', function () {
        $reflection = new ReflectionClass(BackupDestinationsWidget::class);
        $property = $reflection->getProperty('pollingInterval');

        expect($property->getValue(null))->toBe('30s');
    });

    it('destinations widget spans full width', function () {
        $widget = new BackupDestinationsWidget;
        $reflection = new ReflectionClass($widget);
        $property = $reflection->getProperty('columnSpan');

        expect($property->getValue($widget))->toBe('full');
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
            ->toHaveCount(6);
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

describe('Tool Actions', function () {
    beforeEach(function () {
        $this->user = User::factory()->create(['email' => 'sourov2305101004@diu.edu.bd']);
        $this->actingAs($this->user);
    });

    it('can run health check action', function () {
        livewire(Backups::class)
            ->callAction('run_monitor')
            ->assertOk();
    });

    it('can run cleanup action', function () {
        livewire(Backups::class)
            ->callAction('run_cleanup')
            ->assertNotified('Cleanup Complete');
    });

    it('can open list backups modal', function () {
        livewire(Backups::class)
            ->callAction('list_backups')
            ->assertOk();
    });
});

describe('Age Formatting', function () {
    beforeEach(function () {
        $this->user = User::factory()->create(['email' => 'sourov2305101004@diu.edu.bd']);
        $this->actingAs($this->user);
    });

    it('formats age less than 1 hour correctly', function () {
        $page = new Backups;
        $method = new ReflectionMethod($page, 'formatAge');

        expect($method->invoke($page, 0.02))->toBe('Less than 1 hour');
    });

    it('formats age in hours correctly', function () {
        $page = new Backups;
        $method = new ReflectionMethod($page, 'formatAge');

        expect($method->invoke($page, 0.5))->toBe('12 hours');
    });

    it('formats age as 1 day correctly', function () {
        $page = new Backups;
        $method = new ReflectionMethod($page, 'formatAge');

        expect($method->invoke($page, 1))->toBe('1 day');
    });

    it('formats age in days correctly', function () {
        $page = new Backups;
        $method = new ReflectionMethod($page, 'formatAge');

        expect($method->invoke($page, 3.5))->toBe('3.5 days');
    });

    it('formats age as 1 week correctly', function () {
        $page = new Backups;
        $method = new ReflectionMethod($page, 'formatAge');

        expect($method->invoke($page, 7))->toBe('1 week');
    });

    it('formats age in weeks correctly', function () {
        $page = new Backups;
        $method = new ReflectionMethod($page, 'formatAge');

        expect($method->invoke($page, 14))->toBe('2 weeks');
    });
});
