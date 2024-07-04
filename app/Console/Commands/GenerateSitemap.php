<?php

namespace App\Console\Commands;

use App\Models\Question;
use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\SitemapIndex;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate-sitemap';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Sitemap::create()
            ->add(Question::latest()->get())
            ->writeToFile(public_path('/questions_sitemap.xml'));

        Sitemap::create()
            ->add(User::latest()->get())
            ->writeToFile(public_path('/contributors_sitemap.xml'));

        SitemapIndex::create()
            ->add('/questions_sitemap.xml')
            ->add('/contributors_sitemap.xml')
            ->writeToFile(public_path('/sitemap.xml'));

        $this->info('Sitemap generated successfully.');
    }
}
