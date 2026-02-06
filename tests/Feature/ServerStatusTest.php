<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guest cannot access server status page', function () {
    $response = $this->get('/server-status');

    $response->assertRedirect('/login');
});

test('authenticated user can view server status page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/server-status');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('server-status')
        ->has('generatedAt')
        ->has('system')
        ->has('load')
        ->has('cpu')
        ->has('memory')
        ->has('disk')
        ->has('runtime')
        ->has('config')
    );
});
