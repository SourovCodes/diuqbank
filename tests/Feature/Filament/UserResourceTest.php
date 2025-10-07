<?php

use App\Filament\Resources\Users\Pages\CreateUser;
use App\Filament\Resources\Users\Pages\EditUser;
use App\Filament\Resources\Users\Pages\ListUsers;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Filament::setCurrentPanel('admin');
});

it('lists users in the table', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    $users = User::factory()->count(3)->create();

    actingAs($admin);

    Livewire::test(ListUsers::class)
        ->assertOk()
        ->assertCanSeeTableRecords($users);
});

it('creates a user from the form', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    /** @var User $newUserData */
    $newUserData = User::factory()->make();

    actingAs($admin);

    $password = 'Secret123!';

    Livewire::test(CreateUser::class)
        ->assertOk()
        ->fillForm([
            'name' => $newUserData->name,
            'email' => $newUserData->email,
            'username' => $newUserData->username,
            'student_id' => $newUserData->student_id,
            'password' => $password,
            'password_confirmation' => $password,
        ])
        ->call('create')
        ->assertNotified()
        ->assertRedirect();

    assertDatabaseHas(User::class, [
        'email' => $newUserData->email,
        'username' => $newUserData->username,
    ]);
});

it('updates a user from the form', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    /** @var User $user */
    $user = User::factory()->create();
    /** @var User $newUserData */
    $newUserData = User::factory()->make();

    actingAs($admin);

    Livewire::test(EditUser::class, ['record' => $user->getKey()])
        ->assertOk()
        ->fillForm([
            'name' => $newUserData->name,
            'email' => $newUserData->email,
            'username' => $newUserData->username,
            'student_id' => $newUserData->student_id,
        ])
        ->call('save')
        ->assertNotified();

    assertDatabaseHas(User::class, [
        'id' => $user->id,
        'email' => $newUserData->email,
        'username' => $newUserData->username,
    ]);
});
