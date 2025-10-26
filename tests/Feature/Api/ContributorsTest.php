<?php

use App\Models\Question;
use App\Models\User;

use function Pest\Laravel\getJson;

it('returns a paginated list of contributors', function () {
    // Create users with questions
    $userWithMostQuestions = User::factory()->create();
    Question::factory()->count(5)->for($userWithMostQuestions, 'user')->create(['view_count' => 100]);

    $userWithFewerQuestions = User::factory()->create();
    Question::factory()->count(3)->for($userWithFewerQuestions, 'user')->create(['view_count' => 50]);

    // Create user without questions (should not appear)
    User::factory()->create();

    $response = getJson('/api/contributors');

    $response->assertSuccessful()
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'name',
                    'username',
                    'student_id',
                    'questions_count',
                    'total_views',
                    'avatar',
                ],
            ],
            'links',
            'meta',
        ]);

    // Verify only users with questions are returned
    expect($response->json('data'))->toHaveCount(2);

    // Verify ordering by questions_count (descending)
    $firstContributor = $response->json('data.0');
    expect($firstContributor['questions_count'])->toBe(5);
    expect($firstContributor['total_views'])->toBe(500);

    $secondContributor = $response->json('data.1');
    expect($secondContributor['questions_count'])->toBe(3);
    expect($secondContributor['total_views'])->toBe(150);
});

it('paginates contributors correctly', function () {
    // Create 20 users with questions
    User::factory()->count(20)->create()->each(function ($user) {
        Question::factory()->count(2)->for($user, 'user')->create();
    });

    $response = getJson('/api/contributors');

    $response->assertSuccessful();

    // Verify pagination
    expect($response->json('data'))->toHaveCount(15);
    expect($response->json('meta.total'))->toBe(20);
    expect($response->json('meta.per_page'))->toBe(15);
    expect($response->json('meta.current_page'))->toBe(1);
});

it('returns empty data when no contributors exist', function () {
    $response = getJson('/api/contributors');

    $response->assertSuccessful()
        ->assertJson([
            'data' => [],
        ]);
});
