<?php

namespace App\Http\Requests\Api\V1\Concerns;

use App\Models\Course;
use Illuminate\Validation\Validator;

trait ValidatesCourseDepartment
{
    /**
     * Validate that the course belongs to the selected department.
     */
    protected function validateCourseBelongsToDepartment(Validator $validator, int $departmentId, int $courseId): void
    {
        if ($validator->errors()->hasAny(['department_id', 'course_id'])) {
            return;
        }

        $course = Course::find($courseId);

        if ($course && $course->department_id !== $departmentId) {
            $validator->errors()->add(
                'course_id',
                'The selected course does not belong to the selected department.'
            );
        }
    }
}
