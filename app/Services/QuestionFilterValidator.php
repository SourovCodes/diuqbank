<?php

namespace App\Services;

class QuestionFilterValidator
{
    /**
     * Validate filter parameters and return array of invalid parameter names.
     */
    public function getInvalidParams(
        array $filterOptions,
        ?int $departmentId,
        ?int $courseId,
        ?int $semesterId,
        ?int $examTypeId
    ): array {
        $invalidParams = [];

        if ($departmentId && ! $filterOptions['departments']->contains('id', $departmentId)) {
            $invalidParams[] = 'department_id';
        }

        if ($courseId && ! $filterOptions['courses']->contains('id', $courseId)) {
            $invalidParams[] = 'course_id';
        }

        if ($semesterId && ! $filterOptions['semesters']->contains('id', $semesterId)) {
            $invalidParams[] = 'semester_id';
        }

        if ($examTypeId && ! $filterOptions['examTypes']->contains('id', $examTypeId)) {
            $invalidParams[] = 'exam_type_id';
        }

        return $invalidParams;
    }
}
