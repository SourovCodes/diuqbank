<?php

namespace App\Console\Commands;

use App\Models\Question;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class UpdateViewCounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-view-counts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update view counts from cache to database';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $models = Question::all();

        foreach ($models as $model) {
            $cacheKey = 'view_count_' . $model->id;
            $cachedViews = Cache::get($cacheKey);

            if ($cachedViews) {
                $model->increment('view_count', $cachedViews);
                Cache::forget($cacheKey);
                Cache::forget('question+' . $model->id);
            }
        }

        $this->info('View counts updated successfully.');
    }
}
