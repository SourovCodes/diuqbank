<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

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
        \Spatie\Sitemap\Sitemap::create()
            ->add(\App\Models\Question::all())
            ->writeToFile(public_path('/questions_sitemap.xml'));

        \Spatie\Sitemap\Sitemap::create()
            ->add(\App\Models\User::all())
            ->writeToFile(public_path('/contributors_sitemap.xml'));

        \Spatie\Sitemap\SitemapIndex::create()
            ->add('/questions_sitemap.xml')
            ->add('/contributors_sitemap.xml')
            ->writeToFile(public_path('/sitemap.xml'));

        $this->info('Sitemap generated successfully.');
    }
}
