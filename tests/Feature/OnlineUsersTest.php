<?php

use App\Models\User;
use App\Services\OnlineUsersService;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Cache::flush();
});

test('tracks authenticated users as online', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/');

    expect(Cache::has('user-online-'.$user->id))->toBeTrue();
});

test('tracks guest users as online', function () {
    $response = $this->get('/');

    $sessionId = session()->getId();

    expect(Cache::has('guest-online-'.$sessionId))->toBeTrue();
});

test('online users count is shared with inertia', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/');

    $response->assertInertia(fn ($page) => $page->has('onlineUsersCount'));
});

test('online users service counts correctly', function () {
    $service = app(OnlineUsersService::class);

    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    // Simulate users visiting the site
    $service->trackUser($user1->id);
    $service->trackUser($user2->id);

    $count = $service->getOnlineCount();

    expect($count)->toBe(2);
});

test('online users count expires after 5 minutes', function () {
    $service = app(OnlineUsersService::class);
    $user = User::factory()->create();

    $service->trackUser($user->id);

    // User should be online initially
    expect($service->getOnlineCount())->toBe(1);

    // Travel 6 minutes into the future
    $this->travel(6)->minutes();

    // User should no longer be online
    expect($service->getOnlineCount())->toBe(0);
});
