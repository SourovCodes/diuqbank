<?php

use App\Filament\Resources\Questions\Pages\CreateQuestion;
use App\Filament\Resources\Questions\Pages\EditQuestion;
use App\Filament\Resources\Questions\Pages\ListQuestions;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Filament::setCurrentPanel('admin');
    Storage::fake('public');
});

function fakePdf(string $name, int $kilobytes = 10): UploadedFile
{
    $header = "%PDF-1.4\n%âãÏÓ\n";
    $body = \str_repeat('0 0 obj\n<< /Length 0 >>\nstream\n'.\str_repeat('F', 64)."\nendstream\nendobj\n", max(1, $kilobytes));
    $content = $header.$body."trailer\n<<>>\n%%EOF";

    return UploadedFile::fake()
        ->createWithContent($name, $content)
        ->mimeType('application/pdf');
}

it('lists questions in the table', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    /** @var User $uploader */
    $uploader = User::factory()->create();
    /** @var Department $department */
    $department = Department::factory()->create(['name' => 'Computer Science']);
    /** @var Semester $semester */
    $semester = Semester::factory()->create(['name' => 'Spring 2026']);
    /** @var ExamType $examType */
    $examType = ExamType::factory()->create(['name' => 'Final', 'requires_section' => false]);

    $courses = [
        Course::factory()->for($department)->create(['name' => 'Course Alpha']),
        Course::factory()->for($department)->create(['name' => 'Course Beta']),
        Course::factory()->for($department)->create(['name' => 'Course Gamma']),
    ];

    $questions = collect($courses)->map(function (Course $course) use ($uploader, $department, $semester, $examType) {
        /** @var Question $question */
        $question = Question::factory()
            ->for($uploader, 'user')
            ->for($department)
            ->for($course)
            ->for($semester)
            ->for($examType)
            ->create([
                'section' => null,
                'view_count' => 5,
            ]);

        return $question;
    });

    actingAs($admin);

    Livewire::test(ListQuestions::class)
        ->assertOk()
        ->assertCanSeeTableRecords($questions);
});

it('creates a question from the form', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    /** @var User $uploader */
    $uploader = User::factory()->create();
    /** @var Department $department */
    $department = Department::factory()->create();
    /** @var Course $course */
    $course = Course::factory()->for($department)->create(['name' => 'Advanced Algorithms']);
    /** @var Semester $semester */
    $semester = Semester::factory()->create(['name' => 'Fall 2025']);
    /** @var ExamType $examType */
    $examType = ExamType::factory()->create(['name' => 'Quiz', 'requires_section' => true]);

    actingAs($admin);

    Livewire::test(CreateQuestion::class)
        ->assertOk()
        ->fillForm([
            'user_id' => $uploader->getKey(),
            'department_id' => $department->getKey(),
            'course_id' => $course->getKey(),
            'semester_id' => $semester->getKey(),
            'exam_type_id' => $examType->getKey(),
            'section' => 'c',
            'pdf' => fakePdf('question.pdf', 400),
        ])
        ->call('create')
        ->assertNotified()
        ->assertRedirect();

    /** @var Question $question */
    $question = Question::query()->first();

    expect($question)->not->toBeNull();
    expect($question->user_id)->toBe($uploader->id);
    expect($question->course_id)->toBe($course->id);
    expect($question->section)->toBe('C');
    expect($question->hasMedia('pdf'))->toBeTrue();
});

it('updates a question from the form', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    /** @var User $uploader */
    $uploader = User::factory()->create();

    /** @var Department $initialDepartment */
    $initialDepartment = Department::factory()->create();
    /** @var Course $initialCourse */
    $initialCourse = Course::factory()->for($initialDepartment)->create(['name' => 'Initial Course']);
    /** @var Semester $initialSemester */
    $initialSemester = Semester::factory()->create(['name' => 'Winter 2025']);
    /** @var ExamType $initialExamType */
    $initialExamType = ExamType::factory()->create(['name' => 'Mid', 'requires_section' => false]);

    /** @var Question $question */
    $question = Question::factory()
        ->for($uploader, 'user')
        ->for($initialDepartment)
        ->for($initialCourse)
        ->for($initialSemester)
        ->for($initialExamType)
        ->create([
            'section' => null,
        ]);

    $question
        ->addMedia(fakePdf('initial.pdf', 100))
        ->toMediaCollection('pdf');

    /** @var Department $newDepartment */
    $newDepartment = Department::factory()->create();
    /** @var Course $newCourse */
    $newCourse = Course::factory()->for($newDepartment)->create(['name' => 'Updated Course']);
    /** @var Semester $newSemester */
    $newSemester = Semester::factory()->create(['name' => 'Summer 2026']);
    /** @var ExamType $newExamType */
    $newExamType = ExamType::factory()->create(['name' => 'Lab Final', 'requires_section' => true]);

    actingAs($admin);

    Livewire::test(EditQuestion::class, ['record' => $question->getKey()])
        ->assertOk()
        ->fillForm([
            'user_id' => $uploader->getKey(),
            'department_id' => $newDepartment->getKey(),
            'course_id' => $newCourse->getKey(),
            'semester_id' => $newSemester->getKey(),
            'exam_type_id' => $newExamType->getKey(),
            'section' => 'd',
            'pdf' => fakePdf('updated.pdf', 200),
        ])
        ->call('save')
        ->assertNotified();

    $question->refresh();

    expect($question->department_id)->toBe($newDepartment->id);
    expect($question->course_id)->toBe($newCourse->id);
    expect($question->semester_id)->toBe($newSemester->id);
    expect($question->exam_type_id)->toBe($newExamType->id);
    expect($question->section)->toBe('D');
    expect($question->hasMedia('pdf'))->toBeTrue();
    expect($question->getFirstMedia('pdf')->file_name)->toBe('updated.pdf');
});
