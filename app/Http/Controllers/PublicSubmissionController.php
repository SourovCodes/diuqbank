<?php

namespace App\Http\Controllers;

use App\Http\Resources\PublicSubmissionResource;
use App\Models\Submission;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PublicSubmissionController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        $submissions = Submission::query()
            ->with([
                'media',
                'user',
                'question.department',
                'question.course',
                'question.semester',
                'question.examType',
            ])
            ->withSum('votes', 'value')
            ->latest()
            ->paginate(100)
            ->withQueryString();

        return PublicSubmissionResource::collection($submissions);
    }
}
