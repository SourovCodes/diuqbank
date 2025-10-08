<?php

use App\Filament\Resources\Users\Pages\CreateUser;
use App\Filament\Resources\Users\Pages\EditUser;
use App\Filament\Resources\Users\Pages\ListUsers;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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

it('lists users in the table', function (): void {
    $users = User::factory()->count(3)->create();

    Livewire::test(ListUsers::class)
        ->assertOk()
        ->assertCanSeeTableRecords($users);
});

it('filters users by verification status', function (): void {
    $verified = User::factory()->create();
    $unverified = User::factory()->unverified()->create();

    Livewire::test(ListUsers::class)
        ->filterTable('email_verified', true)
        ->assertCanSeeTableRecords([$verified])
        ->assertCanNotSeeTableRecords([$unverified]);
});

it('creates a user from the create page', function (): void {
    $newUser = User::factory()->make();
    $plainPassword = 'SecurePass123!';

    Livewire::test(CreateUser::class)
        ->assertOk()
        ->fillForm([
            'name' => $newUser->name,
            'email' => $newUser->email,
            'username' => $newUser->username,
            'student_id' => $newUser->student_id,
            'password' => $plainPassword,
            'password_confirmation' => $plainPassword,
        ])
        ->call('create')
        ->assertNotified()
        ->assertRedirect();

    $created = User::query()
        ->where('email', $newUser->email)
        ->first();

    expect($created)->not->toBeNull();
    expect(Hash::check($plainPassword, $created->password))->toBeTrue();
});

it('updates a user from the edit page', function (): void {
    $user = User::factory()->create([
        'name' => 'Original Name',
        'email' => 'original@example.com',
        'username' => 'original',
        'student_id' => 'STU-0001',
    ]);

    Livewire::test(EditUser::class, [
        'record' => $user->getKey(),
    ])
        ->assertOk()
        ->fillForm([
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'username' => 'updated_username',
            'student_id' => 'STU-9999',
        ])
        ->call('save')
        ->assertNotified();

    assertDatabaseHas(User::class, [
        'id' => $user->getKey(),
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
        'username' => 'updated_username',
        'student_id' => 'STU-9999',
    ]);
});
