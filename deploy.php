<?php

namespace Deployer;

require 'recipe/laravel.php';

/*
|--------------------------------------------------------------------------
| Basic Config
|--------------------------------------------------------------------------
*/

set('repository', 'https://github.com/SourovCodes/diuqbank.git');
set('branch', getenv('DEPLOY_BRANCH') ?: 'main');
set('keep_releases', 2);

/*
|--------------------------------------------------------------------------
| Laravel Shared & Writable Paths
|--------------------------------------------------------------------------
*/

set('shared_dirs', [
    'storage',
]);

set('shared_files', [
    '.env',
]);

set('writable_dirs', [
    'storage',
    'bootstrap/cache',
]);

set('writable_mode', 'chmod');

/*
|--------------------------------------------------------------------------
| Load Environment Variables
|--------------------------------------------------------------------------
*/

$hostname   = getenv('DEPLOY_HOSTNAME');
$deployPath = getenv('DEPLOY_PATH');
$sshPort    = getenv('DEPLOY_SSH_PORT');

if (! $hostname) {
    throw new \RuntimeException('DEPLOY_HOSTNAME environment variable is required');
}

if (! $deployPath) {
    throw new \RuntimeException('DEPLOY_PATH environment variable is required');
}

if (! $sshPort) {
    throw new \RuntimeException('DEPLOY_SSH_PORT environment variable is required');
}

/*
|--------------------------------------------------------------------------
| Hosts
|--------------------------------------------------------------------------
*/

host($hostname)
    ->set('remote_user', 'sourov')
    ->set('deploy_path', $deployPath)
    ->set('http_user', 'www-data')
    ->set('port', $sshPort);

/*
|--------------------------------------------------------------------------
| Local Asset Build (Skipped - GitHub Actions builds assets)
|--------------------------------------------------------------------------
*/

task('build:assets', function () {
    writeln('⏭️  Skipping local build - assets already built by CI');
})->desc('Skip local asset build (handled by CI)');

/*
|--------------------------------------------------------------------------
| Upload Built Assets
|--------------------------------------------------------------------------
*/

task('upload:assets', function () {
    writeln('🚀 Uploading built assets...');
    $user        = get('remote_user');
    $hostname    = currentHost()->getHostname();
    $port        = get('port');
    $releasePath = get('release_path');
    $archive     = 'build-assets.tar.gz';

    runLocally("tar -czf {$archive} -C public build");
    runLocally("scp -P {$port} {$archive} {$user}@{$hostname}:{$releasePath}/");
    run("tar -xzf {$releasePath}/{$archive} -C {$releasePath}/public/");
    runLocally("rm {$archive}");
    run("rm {$releasePath}/{$archive}");
})->desc('Upload built assets');

/*
|--------------------------------------------------------------------------
| Skip npm on Server
|--------------------------------------------------------------------------
*/

task('deploy:npm', function () {
    writeln('⏭️  Skipping npm install on server');
});

/*
|--------------------------------------------------------------------------
| Fix Permissions After Deploy
|--------------------------------------------------------------------------
*/

task('permissions:fix', function () {
    // Use find to only chmod files owned by the deploy user, avoiding permission errors on www-data owned files
    run('find {{release_path}}/storage {{release_path}}/bootstrap/cache -user $(whoami) -exec chmod 775 {} \; 2>/dev/null || true');
})->desc('Fix Laravel writable permissions');

/*
|--------------------------------------------------------------------------
| Restart Queue Workers
|--------------------------------------------------------------------------
*/

task('queue:restart', function () {
    writeln('🔄 Gracefully restarting queue workers...');
    // This signals workers to finish their current job, then restart
    run('cd {{release_path}} && php artisan queue:restart');
})->desc('Gracefully restart queue workers');

/*
|--------------------------------------------------------------------------
| Hooks
|--------------------------------------------------------------------------
*/

// Build assets locally before deployment starts
before('deploy', 'build:assets');

// Upload assets after vendors are installed
after('deploy:vendors', 'upload:assets');

// Fix permissions after symlink switch
after('deploy:symlink', 'permissions:fix');

// Restart queue workers after deployment
after('deploy:symlink', 'queue:restart');

// Unlock if deploy fails
after('deploy:failed', 'deploy:unlock');