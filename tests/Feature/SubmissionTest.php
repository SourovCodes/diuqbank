<?php

use App\Enums\QuestionStatus;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * Create a fake PDF file with valid PDF content for testing.
 */
function createFakePdf(string $name = 'test.pdf', int $sizeKb = 1): UploadedFile
{
    // Minimal valid PDF content
    $pdfContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n115\n%%EOF";

    $tempPath = sys_get_temp_dir().'/'.$name;
    file_put_contents($tempPath, $pdfContent);

    return new UploadedFile($tempPath, $name, 'application/pdf', null, true);
}

test('guest cannot access submission create page', function () {
    $response = $this->get('/submissions/create');

    $response->assertRedirect('/login');
});

test('authenticated user can view submission create page', function () {
    $user = User::factory()->create();
    Department::factory()->create();
    Semester::factory()->create();
    ExamType::factory()->create();

    $response = $this->actingAs($user)->get('/submissions/create');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('submissions/create')
        ->has('formOptions.departments')
        ->has('formOptions.courses')
        ->has('formOptions.semesters')
        ->has('formOptions.examTypes')
    );
});

test('user can create submission with existing question', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

    $question = Question::factory()->published()->create([
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ]);

    $pdf = createFakePdf();

    $response = $this->actingAs($user)->post('/submissions', [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'pdf' => $pdf,
    ]);

    $response->assertRedirect(route('questions.show', $question));

    $this->assertDatabaseHas('submissions', [
        'question_id' => $question->id,
        'user_id' => $user->id,
    ]);
});

test('user can create submission and new question is created when none exists', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

    $pdf = createFakePdf();

    $response = $this->actingAs($user)->post('/submissions', [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'pdf' => $pdf,
    ]);

    $question = Question::where([
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ])->first();

    expect($question)->not->toBeNull();
    $response->assertRedirect(route('questions.show', $question));

    $this->assertDatabaseHas('submissions', [
        'question_id' => $question->id,
        'user_id' => $user->id,
    ]);
});

test('new question is auto-published when all 4 parameters have published questions', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

    // Create published questions for each parameter
    Question::factory()->published()->create(['department_id' => $department->id]);
    Question::factory()->published()->create(['course_id' => $course->id]);
    Question::factory()->published()->create(['semester_id' => $semester->id]);
    Question::factory()->published()->create(['exam_type_id' => $examType->id]);

    $pdf = createFakePdf();

    $this->actingAs($user)->post('/submissions', [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'pdf' => $pdf,
    ]);

    $question = Question::where([
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ])->first();

    expect($question->status)->toBe(QuestionStatus::Published);
});

test('new question is pending review when not all parameters have published questions', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

    // Only create published questions for some parameters
    Question::factory()->published()->create(['department_id' => $department->id]);
    Question::factory()->published()->create(['course_id' => $course->id]);
    // No published question for semester and exam_type

    $pdf = createFakePdf();

    $this->actingAs($user)->post('/submissions', [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'pdf' => $pdf,
    ]);

    $question = Question::where([
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ])->first();

    expect($question->status)->toBe(QuestionStatus::PendingReview);
});

test('user can create new course via api', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();

    $newCourseName = 'Advanced Algorithms';

    $response = $this->actingAs($user)->postJson('/courses', [
        'name' => $newCourseName,
        'department_id' => $department->id,
    ]);

    $response->assertStatus(201);
    $response->assertJsonStructure([
        'course' => ['id', 'name', 'department_id'],
    ]);

    $this->assertDatabaseHas('courses', [
        'name' => $newCourseName,
        'department_id' => $department->id,
    ]);
});

test('creating duplicate course returns existing course', function () {
    $user = User::factory()->create();
    $existingCourse = Course::factory()->create();

    $response = $this->actingAs($user)->postJson('/courses', [
        'name' => $existingCourse->name,
        'department_id' => $existingCourse->department_id,
    ]);

    $response->assertStatus(200);
    $response->assertJson([
        'course' => [
            'id' => $existingCourse->id,
            'name' => $existingCourse->name,
            'department_id' => $existingCourse->department_id,
        ],
    ]);

    $this->assertDatabaseCount('courses', 1);
});

test('user can create new semester via api', function () {
    $user = User::factory()->create();

    $newSemesterName = 'Fall 26';

    $response = $this->actingAs($user)->postJson('/semesters', [
        'name' => $newSemesterName,
    ]);

    $response->assertStatus(201);
    $response->assertJsonStructure([
        'semester' => ['id', 'name'],
    ]);

    $this->assertDatabaseHas('semesters', [
        'name' => $newSemesterName,
    ]);
});

test('creating duplicate semester returns existing semester', function () {
    $user = User::factory()->create();
    $existingSemester = Semester::factory()->create(['name' => 'Fall 25']);

    $response = $this->actingAs($user)->postJson('/semesters', [
        'name' => 'Fall 25',
    ]);

    $response->assertStatus(200);
    $response->assertJson([
        'semester' => [
            'id' => $existingSemester->id,
            'name' => $existingSemester->name,
        ],
    ]);

    $this->assertDatabaseCount('semesters', 1);
});

test('submission requires all fields', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/submissions', []);

    $response->assertSessionHasErrors([
        'department_id',
        'course_id',
        'semester_id',
        'exam_type_id',
        'pdf',
    ]);
});

test('submission requires valid pdf file', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

    $invalidFile = UploadedFile::fake()->create('test.txt', 1000, 'text/plain');

    $response = $this->actingAs($user)->post('/submissions', [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'pdf' => $invalidFile,
    ]);

    $response->assertSessionHasErrors(['pdf']);
});

test('user can view edit page for their own submission', function () {
    $user = User::factory()->create();
    $submission = Submission::factory()->create(['user_id' => $user->id]);
    Department::factory()->create();
    Semester::factory()->create();
    ExamType::factory()->create();

    $response = $this->actingAs($user)->get("/submissions/{$submission->id}/edit");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('submissions/edit')
        ->has('submission')
        ->has('formOptions')
    );
});

test('user cannot view edit page for other users submission', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $submission = Submission::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user)->get("/submissions/{$submission->id}/edit");

    $response->assertStatus(403);
});

test('user can update their own submission', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

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

    // Create new options to update to
    $newDepartment = Department::factory()->create();
    $newCourse = Course::factory()->create(['department_id' => $newDepartment->id]);
    $newSemester = Semester::factory()->create();
    $newExamType = ExamType::factory()->create();

    $response = $this->actingAs($user)->put("/submissions/{$submission->id}", [
        'department_id' => $newDepartment->id,
        'course_id' => $newCourse->id,
        'semester_id' => $newSemester->id,
        'exam_type_id' => $newExamType->id,
    ]);

    // Should redirect to the new question
    $newQuestion = Question::where([
        'department_id' => $newDepartment->id,
        'course_id' => $newCourse->id,
        'semester_id' => $newSemester->id,
        'exam_type_id' => $newExamType->id,
    ])->first();

    $response->assertRedirect(route('questions.show', $newQuestion));

    $this->assertDatabaseHas('submissions', [
        'id' => $submission->id,
        'question_id' => $newQuestion->id,
    ]);
});

test('user cannot update other users submission', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create();

    $submission = Submission::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user)->put("/submissions/{$submission->id}", [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ]);

    $response->assertStatus(403);
});

test('section is required when exam type requires section', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => true]);

    $pdf = createFakePdf();

    $response = $this->actingAs($user)->post(route('dashboard.submissions.store'), [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'pdf' => $pdf,
    ]);

    $response->assertSessionHasErrors(['section']);
});

test('section is optional when exam type does not require section', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => false]);

    $pdf = createFakePdf();

    $response = $this->actingAs($user)->post(route('dashboard.submissions.store'), [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'pdf' => $pdf,
    ]);

    $response->assertSessionHasNoErrors();
});

test('section is saved when provided', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => true]);

    $pdf = createFakePdf();

    $this->actingAs($user)->post(route('dashboard.submissions.store'), [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => 'A',
        'pdf' => $pdf,
    ]);

    $this->assertDatabaseHas('submissions', [
        'user_id' => $user->id,
        'section' => 'A',
    ]);
});

test('section can be updated', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $course = Course::factory()->create(['department_id' => $department->id]);
    $semester = Semester::factory()->create();
    $examType = ExamType::factory()->create(['requires_section' => true]);

    $question = Question::factory()->published()->create([
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
    ]);

    $submission = Submission::factory()->create([
        'user_id' => $user->id,
        'question_id' => $question->id,
        'section' => 'A',
    ]);

    $this->actingAs($user)->put(route('dashboard.submissions.update', $submission), [
        'department_id' => $department->id,
        'course_id' => $course->id,
        'semester_id' => $semester->id,
        'exam_type_id' => $examType->id,
        'section' => 'B',
    ]);

    $this->assertDatabaseHas('submissions', [
        'id' => $submission->id,
        'section' => 'B',
    ]);
});
