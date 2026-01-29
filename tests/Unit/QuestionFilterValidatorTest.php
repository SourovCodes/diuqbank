<?php

use App\Services\QuestionFilterValidator;

beforeEach(function () {
    $this->validator = new QuestionFilterValidator;

    $this->filterOptions = [
        'departments' => collect([
            (object) ['id' => 1, 'name' => 'CSE'],
            (object) ['id' => 2, 'name' => 'EEE'],
        ]),
        'courses' => collect([
            (object) ['id' => 10, 'name' => 'Algorithms'],
            (object) ['id' => 20, 'name' => 'Circuits'],
        ]),
        'semesters' => collect([
            (object) ['id' => 100, 'name' => 'Fall 2025'],
            (object) ['id' => 200, 'name' => 'Spring 2026'],
        ]),
        'examTypes' => collect([
            (object) ['id' => 1000, 'name' => 'Midterm'],
            (object) ['id' => 2000, 'name' => 'Final'],
        ]),
    ];
});

test('returns empty array when all parameters are valid', function () {
    $invalidParams = $this->validator->getInvalidParams(
        $this->filterOptions,
        departmentId: 1,
        courseId: 10,
        semesterId: 100,
        examTypeId: 1000
    );

    expect($invalidParams)->toBeArray()->toBeEmpty();
});

test('returns empty array when all parameters are null', function () {
    $invalidParams = $this->validator->getInvalidParams(
        $this->filterOptions,
        departmentId: null,
        courseId: null,
        semesterId: null,
        examTypeId: null
    );

    expect($invalidParams)->toBeArray()->toBeEmpty();
});

test('returns department_id when department is invalid', function () {
    $invalidParams = $this->validator->getInvalidParams(
        $this->filterOptions,
        departmentId: 999,
        courseId: 10,
        semesterId: 100,
        examTypeId: 1000
    );

    expect($invalidParams)->toContain('department_id');
    expect($invalidParams)->not->toContain('course_id');
});

test('returns course_id when course is invalid', function () {
    $invalidParams = $this->validator->getInvalidParams(
        $this->filterOptions,
        departmentId: 1,
        courseId: 999,
        semesterId: 100,
        examTypeId: 1000
    );

    expect($invalidParams)->toContain('course_id');
    expect($invalidParams)->not->toContain('department_id');
});

test('returns semester_id when semester is invalid', function () {
    $invalidParams = $this->validator->getInvalidParams(
        $this->filterOptions,
        departmentId: 1,
        courseId: 10,
        semesterId: 999,
        examTypeId: 1000
    );

    expect($invalidParams)->toContain('semester_id');
});

test('returns exam_type_id when exam type is invalid', function () {
    $invalidParams = $this->validator->getInvalidParams(
        $this->filterOptions,
        departmentId: 1,
        courseId: 10,
        semesterId: 100,
        examTypeId: 9999
    );

    expect($invalidParams)->toContain('exam_type_id');
});

test('returns multiple invalid params when multiple are invalid', function () {
    $invalidParams = $this->validator->getInvalidParams(
        $this->filterOptions,
        departmentId: 999,
        courseId: 888,
        semesterId: 777,
        examTypeId: 666
    );

    expect($invalidParams)->toHaveCount(4);
    expect($invalidParams)->toContain('department_id');
    expect($invalidParams)->toContain('course_id');
    expect($invalidParams)->toContain('semester_id');
    expect($invalidParams)->toContain('exam_type_id');
});

test('ignores null parameters when validating', function () {
    $invalidParams = $this->validator->getInvalidParams(
        $this->filterOptions,
        departmentId: null,
        courseId: 999,
        semesterId: null,
        examTypeId: null
    );

    expect($invalidParams)->toHaveCount(1);
    expect($invalidParams)->toContain('course_id');
});
