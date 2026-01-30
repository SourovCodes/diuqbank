<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Collection;
use Illuminate\Support\Number;
use Spatie\Backup\Config\Config;
use Spatie\Backup\Tasks\Monitor\BackupDestinationStatus;
use Spatie\Backup\Tasks\Monitor\BackupDestinationStatusFactory;

class BackupsStats extends StatsOverviewWidget
{
    protected ?string $pollingInterval = '30s';

    protected function getStats(): array
    {
        try {
            $config = app(Config::class);
            $statuses = BackupDestinationStatusFactory::createForMonitorConfig($config->monitoredBackups);

            if ($statuses->isEmpty()) {
                return $this->getEmptyStats();
            }

            return [
                $this->getHealthStat($statuses),
                $this->getBackupCountStat($statuses),
                $this->getStorageUsedStat($statuses, $config),
                $this->getNewestBackupStat($statuses),
            ];
        } catch (\Exception) {
            return $this->getEmptyStats();
        }
    }

    /**
     * @param  Collection<int, BackupDestinationStatus>  $statuses
     */
    private function getHealthStat(Collection $statuses): Stat
    {
        $healthyCount = 0;
        $unhealthyDisks = [];
        $unreachableDisks = [];

        foreach ($statuses as $status) {
            $destination = $status->backupDestination();
            $diskName = $destination->diskName();

            if (! $destination->isReachable()) {
                $unreachableDisks[] = $diskName;

                continue;
            }

            if ($status->isHealthy()) {
                $healthyCount++;
            } else {
                $unhealthyDisks[] = $diskName;
            }
        }

        $totalDisks = $statuses->count();

        if (count($unreachableDisks) > 0) {
            return Stat::make('Health Status', 'Unreachable')
                ->description(count($unreachableDisks).' disk(s) unreachable')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color('danger');
        }

        if (count($unhealthyDisks) > 0) {
            return Stat::make('Health Status', 'Unhealthy')
                ->description(count($unhealthyDisks).' of '.$totalDisks.' disks unhealthy')
                ->descriptionIcon('heroicon-m-x-circle')
                ->color('danger');
        }

        return Stat::make('Health Status', 'Healthy')
            ->description("All {$totalDisks} disks healthy")
            ->descriptionIcon('heroicon-m-check-circle')
            ->color('success');
    }

    /**
     * @param  Collection<int, BackupDestinationStatus>  $statuses
     */
    private function getBackupCountStat(Collection $statuses): Stat
    {
        $totalCount = 0;
        $diskCounts = [];

        foreach ($statuses as $status) {
            $destination = $status->backupDestination();
            $count = $destination->backups()->count();
            $totalCount += $count;
            $diskCounts[$destination->diskName()] = $count;
        }

        $diskDetails = collect($diskCounts)
            ->map(fn ($count, $disk) => $this->getDiskLabel($disk).': '.$count)
            ->implode(', ');

        return Stat::make('Total Backups', (string) $totalCount)
            ->description($diskDetails ?: 'No backups available')
            ->descriptionIcon('heroicon-m-archive-box')
            ->color($totalCount === 0 ? 'danger' : 'primary');
    }

    /**
     * @param  Collection<int, BackupDestinationStatus>  $statuses
     */
    private function getStorageUsedStat(Collection $statuses, Config $config): Stat
    {
        $totalUsedBytes = 0;

        foreach ($statuses as $status) {
            $totalUsedBytes += $status->backupDestination()->usedStorage();
        }

        $usedFormatted = Number::fileSize((int) $totalUsedBytes);

        // Get max storage from config (default 5000 MB) - per disk
        $maxMegabytes = $config->monitoredBackups->monitorBackups[0]['healthChecks'][\Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumStorageInMegabytes::class] ?? 5000;
        $maxBytesPerDisk = $maxMegabytes * 1024 * 1024;
        $totalMaxBytes = $maxBytesPerDisk * $statuses->count();
        $percentUsed = $totalMaxBytes > 0 ? round(($totalUsedBytes / $totalMaxBytes) * 100, 1) : 0;

        $color = match (true) {
            $percentUsed >= 90 => 'danger',
            $percentUsed >= 70 => 'warning',
            default => 'success',
        };

        return Stat::make('Storage Used', $usedFormatted)
            ->description("{$percentUsed}% of ".Number::fileSize($totalMaxBytes).' total limit')
            ->descriptionIcon('heroicon-m-server')
            ->color($color);
    }

    /**
     * @param  Collection<int, BackupDestinationStatus>  $statuses
     */
    private function getNewestBackupStat(Collection $statuses): Stat
    {
        $newestBackup = null;
        $newestDisk = null;

        foreach ($statuses as $status) {
            $destination = $status->backupDestination();
            $backup = $destination->newestBackup();

            if ($backup && ($newestBackup === null || $backup->date()->gt($newestBackup->date()))) {
                $newestBackup = $backup;
                $newestDisk = $destination->diskName();
            }
        }

        if (! $newestBackup) {
            return Stat::make('Newest Backup', 'None')
                ->description('Create your first backup')
                ->descriptionIcon('heroicon-m-clock')
                ->color('danger');
        }

        $date = $newestBackup->date();
        $ageInDays = round($date->diffInMinutes() / (24 * 60), 2);
        $ageFormatted = $date->diffForHumans();

        // Get max age from config (default 1 day)
        $config = app(Config::class);
        $maxAgeDays = $config->monitoredBackups->monitorBackups[0]['healthChecks'][\Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumAgeInDays::class] ?? 1;

        $color = match (true) {
            $ageInDays > $maxAgeDays => 'danger',
            $ageInDays > ($maxAgeDays * 0.75) => 'warning',
            default => 'success',
        };

        return Stat::make('Newest Backup', $ageFormatted)
            ->description($this->getDiskLabel($newestDisk)." • {$ageInDays} days old")
            ->descriptionIcon('heroicon-m-calendar')
            ->color($color);
    }

    private function getDiskLabel(string $disk): string
    {
        return match ($disk) {
            'backups' => 'S3',
            'local-backups' => 'Local',
            default => ucfirst($disk),
        };
    }

    private function getEmptyStats(): array
    {
        return [
            Stat::make('Health Status', 'Unknown')
                ->description('Unable to check health')
                ->descriptionIcon('heroicon-m-question-mark-circle')
                ->color('gray'),
            Stat::make('Total Backups', '0')
                ->description('No backups available')
                ->descriptionIcon('heroicon-m-archive-box')
                ->color('gray'),
            Stat::make('Storage Used', '0 B')
                ->description('No data')
                ->descriptionIcon('heroicon-m-server')
                ->color('gray'),
            Stat::make('Newest Backup', 'None')
                ->description('Create your first backup')
                ->descriptionIcon('heroicon-m-clock')
                ->color('gray'),
        ];
    }
}
