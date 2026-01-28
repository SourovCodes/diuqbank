<?php

namespace App\Services;

use App\Http\Resources\Api\V1\QuestionIndexResource;
use App\Http\Resources\Api\V1\QuestionResource;
use App\Models\Question;
use Illuminate\Support\Facades\Cache;

class QuestionCacheService
{
    /**
     * Cache TTL for question index (2 minutes).
     */
    public const INDEX_TTL = 120;

    /**
     * Cache TTL for question show (5 minutes).
     */
    public const SHOW_TTL = 300;

    /**
     * Cache key prefix for question index.
     */
    public const INDEX_PREFIX = 'questions:index:';

    /**
     * Cache key prefix for question show.
     */
    public const SHOW_PREFIX = 'questions:show:';

    /**
     * Get cached question index or fetch from database.
     *
     * @return array{data: array, meta: array, links: array}
     */
    public function getIndex(
        ?int $departmentId,
        ?int $courseId,
        ?int $semesterId,
        ?int $examTypeId,
        int $perPage,
        int $page
    ): array {
        $cacheKey = $this->buildIndexCacheKey($departmentId, $courseId, $semesterId, $examTypeId, $perPage, $page);

        return Cache::remember($cacheKey, self::INDEX_TTL, function () use ($departmentId, $courseId, $semesterId, $examTypeId, $perPage) {
            $questions = Question::query()
                ->published()
                ->filtered($departmentId, $courseId, $semesterId, $examTypeId)
                ->with(['department', 'course', 'semester', 'examType'])
                ->withMax('submissions', 'views')
                ->latest()
                ->paginate($perPage);

            return QuestionIndexResource::collection($questions)->response()->getData(true);
        });
    }

    /**
     * Get cached question show or fetch from database.
     */
    public function getShow(Question $question): array
    {
        $cacheKey = self::SHOW_PREFIX.$question->id;

        return Cache::remember($cacheKey, self::SHOW_TTL, function () use ($question) {
            $question->load(['department', 'course', 'semester', 'examType'])
                ->load(['submissions' => function ($query) {
                    $query->with(['user', 'media'])
                        ->withVoteCounts()
                        ->orderByRaw('(SELECT COALESCE(SUM(value), 0) FROM votes WHERE votes.submission_id = submissions.id) DESC')
                        ->limit(30);
                }]);

            return (new QuestionResource($question))->response()->getData(true);
        });
    }

    /**
     * Clear cache for a specific question.
     */
    public function clearQuestionCache(int $questionId): void
    {
        Cache::forget(self::SHOW_PREFIX.$questionId);
        $this->clearIndexCache();
    }

    /**
     * Clear all index cache entries.
     * Note: With file/database cache, we use a version key approach.
     */
    public function clearIndexCache(): void
    {
        Cache::increment('questions:index:version');
    }

    /**
     * Build cache key for question index.
     */
    protected function buildIndexCacheKey(
        ?int $departmentId,
        ?int $courseId,
        ?int $semesterId,
        ?int $examTypeId,
        int $perPage,
        int $page
    ): string {
        $version = Cache::get('questions:index:version', 1);

        return self::INDEX_PREFIX.md5(serialize([
            'v' => $version,
            'd' => $departmentId,
            'c' => $courseId,
            's' => $semesterId,
            'e' => $examTypeId,
            'pp' => $perPage,
            'p' => $page,
        ]));
    }
}
