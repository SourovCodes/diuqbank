<?php

use Inertia\Testing\AssertableInertia as Assert;

test('home page can be rendered', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home')
    );
});

test('privacy page can be rendered', function () {
    $response = $this->get('/privacy');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('privacy')
    );
});

test('terms page can be rendered', function () {
    $response = $this->get('/terms');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('terms')
    );
});

test('about page can be rendered', function () {
    $response = $this->get('/about');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('about')
    );
});

test('contact page can be rendered', function () {
    $response = $this->get('/contact');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('contact')
    );
});

test('home page is accessible to guests', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});

test('privacy page is accessible to guests', function () {
    $response = $this->get('/privacy');

    $response->assertStatus(200);
});

test('terms page is accessible to guests', function () {
    $response = $this->get('/terms');

    $response->assertStatus(200);
});
