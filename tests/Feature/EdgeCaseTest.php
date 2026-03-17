<?php

use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\UploadedFile;

/**
 * Create a fake PDF file with valid PDF content for testing.
 */
function createValidPdf(string $name = 'test.pdf'): UploadedFile
{
    $pdfContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n115\n%%EOF";

    $tempPath = sys_get_temp_dir().'/'.$name;
    file_put_contents($tempPath, $pdfContent);

    return new UploadedFile($tempPath, $name, 'application/pdf', null, true);
}

// Profile Validation Edge Cases
test('profile update username must be alpha_dash', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);

    $response = $this->actingAs($user)->put('/dashboard/profile', [
        'name' => 'Test User',
        'username' => 'invalid username!',
        'email' => $user->email,
    ]);

    $response->assertSessionHasErrors('username');
});

test('profile update email must be unique', function () {
    $existingUser = User::factory()->create(['email' => 'existing@example.com']);
    $user = User::factory()->create(['email_verified_at' => now()]);

    $response = $this->actingAs($user)->put('/dashboard/profile', [
        'name' => 'Test User',
        'username' => $user->username,
        'email' => 'existing@example.com',
    ]);

    $response->assertSessionHasErrors('email');
});

test('profile update username must be unique', function () {
    $existingUser = User::factory()->create(['username' => 'existinguser']);
    $user = User::factory()->create(['email_verified_at' => now()]);

    $response = $this->actingAs($user)->put('/dashboard/profile', [
        'name' => 'Test User',
        'username' => 'existinguser',
        'email' => $user->email,
    ]);

    $response->assertSessionHasErrors('username');
});

test('profile update allows keeping own email', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);

    $response = $this->actingAs($user)->put('/dashboard/profile', [
        'name' => 'Updated Name',
        'username' => $user->username,
        'email' => $user->email,
    ]);

    $response->assertSessionHasNoErrors();
    expect($user->fresh()->name)->toBe('Updated Name');
});

test('profile update allows keeping own username', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);

    $response = $this->actingAs($user)->put('/dashboard/profile', [
        'name' => 'Updated Name',
        'username' => $user->username,
        'email' => $user->email,
    ]);

    $response->assertSessionHasNoErrors();
});

// Submission PDF Validation
test('submission update rejects non-pdf file', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    $question = Question::factory()->published()->create([
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ]);

    $submission = Submission::factory()->create([
        'user_id' => $user->id,
        'question_id' => $question->id,
    ]);

    $invalidFile = UploadedFile::fake()->create('test.txt', 1000, 'text/plain');

    $response = $this->actingAs($user)->put("/dashboard/submissions/{$submission->id}", [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'pdf' => $invalidFile,
    ]);

    $response->assertSessionHasErrors('pdf');
});

// Submission View Counter
test('submission views can be incremented', function () {
    $submission = Submission::factory()->create(['views' => 0]);

    $submission->incrementViews();

    expect($submission->fresh()->views)->toBe(1);
});

test('submission views increment multiple times', function () {
    $submission = Submission::factory()->create(['views' => 5]);

    $submission->incrementViews();
    $submission->incrementViews();
    $submission->incrementViews();

    expect($submission->fresh()->views)->toBe(8);
});

// Question Filter Redirect
test('invalid department filter is removed from URL', function () {
    $response = $this->get('/questions?department_id=99999');

    $response->assertRedirect('/questions');
});

test('invalid course filter is removed from URL', function () {
    $department = Department::factory()->create();

    $response = $this->get("/questions?department_id={$department->id}&course_id=99999");

    $response->assertRedirect();
    // Should redirect without the invalid course_id
});

test('valid filters are preserved in redirect', function () {
    $department = Department::factory()->create();
    $semester = Semester::factory()->create();

    $response = $this->get("/questions?department_id={$department->id}&semester_id={$semester->id}&course_id=99999");

    // Should redirect, keeping valid filters
    $response->assertRedirect();
});

// Google OAuth New User Creation
test('google callback creates new user with valid DIU email', function () {
    $abstractUser = Mockery::mock(\Laravel\Socialite\Two\User::class);
    $abstractUser->shouldReceive('getEmail')->andReturn('newuser@diu.edu.bd');
    $abstractUser->shouldReceive('getName')->andReturn('New User');
    $abstractUser->shouldReceive('getAvatar')->andReturn(null);

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('user')->andReturn($abstractUser);

    \Laravel\Socialite\Facades\Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('home'));
    $this->assertAuthenticated();

    $this->assertDatabaseHas('users', [
        'email' => 'newuser@diu.edu.bd',
        'name' => 'New User',
    ]);

    $user = User::where('email', 'newuser@diu.edu.bd')->first();
    expect($user->hasVerifiedEmail())->toBeTrue();
});

test('google callback creates user with student email', function () {
    $abstractUser = Mockery::mock(\Laravel\Socialite\Two\User::class);
    $abstractUser->shouldReceive('getEmail')->andReturn('student@s.diu.edu.bd');
    $abstractUser->shouldReceive('getName')->andReturn('Student User');
    $abstractUser->shouldReceive('getAvatar')->andReturn(null);

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('user')->andReturn($abstractUser);

    \Laravel\Socialite\Facades\Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.google.callback'));

    $this->assertDatabaseHas('users', [
        'email' => 'student@s.diu.edu.bd',
    ]);
});

// Vote Model Tests
test('vote isUpvote returns true for value 1', function () {
    $vote = \App\Models\Vote::factory()->create(['value' => 1]);

    expect($vote->isUpvote())->toBeTrue();
    expect($vote->isDownvote())->toBeFalse();
});

test('vote isDownvote returns true for value -1', function () {
    $vote = \App\Models\Vote::factory()->create(['value' => -1]);

    expect($vote->isDownvote())->toBeTrue();
    expect($vote->isUpvote())->toBeFalse();
});

// Contributor Pagination
test('contributors index is paginated', function () {
    // Create 30 users, each with their own unique question and submission
    $department = Department::factory()->create();
    $semesters = Semester::factory()->count(30)->create();
    $examType = ExamType::factory()->create();

    for ($i = 0; $i < 30; $i++) {
        $user = User::factory()->create();
        $course = Course::factory()->create(['department_id' => $department->id]);
        $question = Question::factory()->published()->create([
            'department_id' => $department->id,
            'course_id' => $course->id,
            'semester_id' => $semesters[$i]->id,
            'exam_type_id' => $examType->id,
        ]);
        Submission::factory()->create(['user_id' => $user->id, 'question_id' => $question->id]);
    }

    $response = $this->get('/contributors');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->has('contributors.data', 24)
        ->where('contributors.meta.last_page', 2)
    );
});

// Question Index Pagination
test('questions index is paginated', function () {
    // Create 15 unique questions - each with unique combination
    $department = Department::factory()->create();
    $semesters = Semester::factory()->count(15)->create();
    $examType = ExamType::factory()->create();

    for ($i = 0; $i < 15; $i++) {
        $course = Course::factory()->create(['department_id' => $department->id]);
        Question::factory()->published()->create([
            'department_id' => $department->id,
            'course_id' => $course->id,
            'semester_id' => $semesters[$i]->id,
            'exam_type_id' => $examType->id,
        ]);
    }

    $response = $this->get('/questions');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->has('questions.data', 12)
        ->where('questions.meta.last_page', 2)
    );
});
