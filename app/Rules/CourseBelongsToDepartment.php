<?php

namespace App\Rules;

use App\Models\Course;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class CourseBelongsToDepartment implements ValidationRule
{
    protected $departmentId;

    public function __construct($departmentId)
    {
        $this->departmentId = $departmentId;
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $course = Course::find($value);

        if ($course && $course->department_id != $this->departmentId) {
            $fail('The selected course does not belong to the selected department.');
        }
    }
}
