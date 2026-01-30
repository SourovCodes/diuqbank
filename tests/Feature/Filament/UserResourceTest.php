<?php

use App\Filament\Resources\Users\Pages\CreateUser;
use App\Filament\Resources\Users\Pages\EditUser;
use App\Filament\Resources\Users\Pages\ListUsers;
use App\Models\User;

use function Pest\Laravel\assertDatabaseHas;
use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('List Page', function () {
    it('can load the list page', function () {
        livewire(ListUsers::class)
            ->assertOk();
    });

    it('can display users in the table', function () {
        $users = User::factory()->count(3)->create();

        livewire(ListUsers::class)
            ->assertCanSeeTableRecords($users);
    });

    it('can search users by name', function () {
        $searchUser = User::factory()->create(['name' => 'John Doe']);
        $otherUser = User::factory()->create(['name' => 'Jane Smith']);

        livewire(ListUsers::class)
            ->searchTable('John Doe')
            ->assertCanSeeTableRecords([$searchUser])
            ->assertCanNotSeeTableRecords([$otherUser]);
    });

    it('can search users by username', function () {
        $searchUser = User::factory()->create(['username' => 'john_doe_123']);
        $otherUser = User::factory()->create(['username' => 'jane_smith_456']);

        livewire(ListUsers::class)
            ->searchTable('john_doe_123')
            ->assertCanSeeTableRecords([$searchUser]);
    });

    it('can search users by student id', function () {
        $searchUser = User::factory()->create(['student_id' => '123-45-6789']);
        $otherUser = User::factory()->create(['student_id' => '987-65-4321']);

        livewire(ListUsers::class)
            ->searchTable('123-45-6789')
            ->assertCanSeeTableRecords([$searchUser])
            ->assertCanNotSeeTableRecords([$otherUser]);
    });

    it('can search users by email', function () {
        $searchUser = User::factory()->create(['email' => 'john@example.com']);
        $otherUser = User::factory()->create(['email' => 'jane@example.com']);

        livewire(ListUsers::class)
            ->searchTable('john@example.com')
            ->assertCanSeeTableRecords([$searchUser])
            ->assertCanNotSeeTableRecords([$otherUser]);
    });

    it('can sort users by name', function () {
        $users = User::factory()->count(3)->create();

        livewire(ListUsers::class)
            ->sortTable('name')
            ->assertCanSeeTableRecords($users->sortBy('name'), inOrder: true)
            ->sortTable('name', 'desc')
            ->assertCanSeeTableRecords($users->sortByDesc('name'), inOrder: true);
    });

    it('can filter verified users', function () {
        $verifiedUser = User::factory()->create(['email_verified_at' => now()]);
        $unverifiedUser = User::factory()->create(['email_verified_at' => null]);

        livewire(ListUsers::class)
            ->filterTable('email_verified_at', true)
            ->assertCanSeeTableRecords([$verifiedUser])
            ->assertCanNotSeeTableRecords([$unverifiedUser]);
    });
});

describe('Create Page', function () {
    it('can load the create page', function () {
        livewire(CreateUser::class)
            ->assertOk();
    });

    it('can create a user', function () {
        $newUserData = User::factory()->make();

        livewire(CreateUser::class)
            ->fillForm([
                'name' => $newUserData->name,
                'username' => 'test_user_123',
                'student_id' => $newUserData->student_id,
                'email' => $newUserData->email,
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        assertDatabaseHas(User::class, [
            'name' => $newUserData->name,
            'username' => 'test_user_123',
            'student_id' => $newUserData->student_id,
            'email' => $newUserData->email,
        ]);
    });

    it('validates required fields', function () {
        livewire(CreateUser::class)
            ->fillForm([
                'name' => null,
                'username' => null,
                'email' => null,
                'password' => null,
            ])
            ->call('create')
            ->assertHasFormErrors([
                'name' => 'required',
                'username' => 'required',
                'email' => 'required',
                'password' => 'required',
            ]);
    });

    it('validates unique username', function () {
        $existingUser = User::factory()->create(['username' => 'takenusername']);

        livewire(CreateUser::class)
            ->fillForm([
                'name' => 'Test User',
                'username' => 'takenusername',
                'email' => 'test@example.com',
                'password' => 'password123',
            ])
            ->call('create')
            ->assertHasFormErrors(['username' => 'unique']);
    });

    it('validates unique email', function () {
        $existingUser = User::factory()->create(['email' => 'taken@example.com']);

        livewire(CreateUser::class)
            ->fillForm([
                'name' => 'Test User',
                'username' => 'newusername',
                'email' => 'taken@example.com',
                'password' => 'password123',
            ])
            ->call('create')
            ->assertHasFormErrors(['email' => 'unique']);
    });

    it('validates unique student id', function () {
        $existingUser = User::factory()->create(['student_id' => '111-22-3333']);

        livewire(CreateUser::class)
            ->fillForm([
                'name' => 'Test User',
                'username' => 'newusername',
                'student_id' => '111-22-3333',
                'email' => 'test@example.com',
                'password' => 'password123',
            ])
            ->call('create')
            ->assertHasFormErrors(['student_id' => 'unique']);
    });

    it('validates email format', function () {
        livewire(CreateUser::class)
            ->fillForm([
                'name' => 'Test User',
                'username' => 'testuser',
                'email' => 'invalid-email',
                'password' => 'password123',
            ])
            ->call('create')
            ->assertHasFormErrors(['email' => 'email']);
    });
});

describe('Edit Page', function () {
    it('can load the edit page', function () {
        $user = User::factory()->create();

        livewire(EditUser::class, ['record' => $user->getRouteKey()])
            ->assertOk();
    });

    it('can update a user', function () {
        $user = User::factory()->create();

        livewire(EditUser::class, ['record' => $user->getRouteKey()])
            ->fillForm([
                'name' => 'Updated Name',
                'username' => 'updatedusername',
                'email' => 'updated@example.com',
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $user->refresh();

        expect($user->name)->toBe('Updated Name')
            ->and($user->username)->toBe('updatedusername')
            ->and($user->email)->toBe('updated@example.com');
    });

    it('can update user without changing password', function () {
        $user = User::factory()->create();
        $originalPassword = $user->password;

        livewire(EditUser::class, ['record' => $user->getRouteKey()])
            ->fillForm([
                'name' => 'Updated Name',
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $user->refresh();

        expect($user->password)->toBe($originalPassword);
    });

    it('can update user password', function () {
        $user = User::factory()->create();
        $originalPassword = $user->password;

        livewire(EditUser::class, ['record' => $user->getRouteKey()])
            ->fillForm([
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $user->refresh();

        expect($user->password)->not->toBe($originalPassword);
    });

    it('validates unique username on edit ignoring current record', function () {
        $user = User::factory()->create(['username' => 'original_username']);
        $otherUser = User::factory()->create(['username' => 'taken_username']);

        livewire(EditUser::class, ['record' => $user->getRouteKey()])
            ->fillForm([
                'username' => 'taken_username',
            ])
            ->call('save')
            ->assertHasFormErrors(['username' => 'unique']);

        // Should allow keeping same username
        livewire(EditUser::class, ['record' => $user->getRouteKey()])
            ->fillForm([
                'username' => 'original_username',
            ])
            ->call('save')
            ->assertHasNoFormErrors();
    });
});
