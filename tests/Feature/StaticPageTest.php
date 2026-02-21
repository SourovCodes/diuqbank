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

test('google analytics tag is not rendered outside production', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertDontSee('G-QPKSEMRTZ2');
    $response->assertDontSee('ca-pub-4157128010679783');
});

test('google analytics tag is rendered in production', function () {
    app()->detectEnvironment(fn () => 'production');

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertSee('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4157128010679783', false);
    $response->assertSee('https://www.googletagmanager.com/gtag/js?id=G-QPKSEMRTZ2', false);
    $response->assertSee("gtag('config', 'G-QPKSEMRTZ2');", false);
});
