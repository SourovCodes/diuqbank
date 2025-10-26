<?php

test('our team page returns successful response', function () {
    $response = $this->get('/our-team');

    $response->assertSuccessful();
});

test('our team page renders correct component', function () {
    $response = $this->get('/our-team');

    $response->assertInertia(fn ($page) => $page->component('our-team'));
});
