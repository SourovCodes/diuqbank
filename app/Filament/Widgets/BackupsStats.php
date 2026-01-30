<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Collection;
use Illuminate\Support\Number;
use Spatie\Backup\Config\Config;
use Spatie\Backup\Tasks\Monitor\BackupDestinationStatus;
use Spatie\Backup\Tasks\Monitor\BackupDestinationStatusFactory;
use Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumAgeInDays;
use Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumStorageInMegabytes;

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
                $this->getNewestBackupStat($statuses, $config),
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
                ->color('danger')
                ->chart([1, 1, 1, 1, 1, 1, 1]);
        }

        if (count($unhealthyDisks) > 0) {
            return Stat::make('Health Status', 'Unhealthy')
                ->description(count($unhealthyDisks).' of '.$totalDisks.' disks unhealthy')
                ->descriptionIcon('heroicon-m-x-circle')
                ->color('danger')
                ->chart([7, 5, 3, 2, 1, 1, 1]);
        }

        return Stat::make('Health Status', 'Healthy')
            ->description("All {$totalDisks} disk(s) healthy")
            ->descriptionIcon('heroicon-m-check-circle')
            ->color('success')
            ->chart([1, 2, 3, 5, 6, 7, 7]);
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

            if (! $destination->isReachable()) {
                continue;
            }

            $count = $destination->backups()->count();
            $totalCount += $count;
            $diskCounts[$destination->diskName()] = $count;
        }

        $diskDetails = collect($diskCounts)
            ->map(fn (int $count, string $disk): string => $this->getDiskLabel($disk).': '.$count)
            ->implode(', ');

        $stat = Stat::make('Total Backups', (string) $totalCount)
            ->description($diskDetails ?: 'No backups available')
            ->descriptionIcon('heroicon-m-archive-box');

        if ($totalCount === 0) {
            return $stat->color('danger');
        }

        return $stat->color('primary')
            ->chart(array_values($diskCounts) ?: [0]);
    }

    /**
     * @param  Collection<int, BackupDestinationStatus>  $statuses
     */
    private function getStorageUsedStat(Collection $statuses, Config $config): Stat
    {
        $totalUsedBytes = 0;
        $reachableCount = 0;

        foreach ($statuses as $status) {
            $destination = $status->backupDestination();

            if (! $destination->isReachable()) {
                continue;
            }

            $totalUsedBytes += $destination->usedStorage();
            $reachableCount++;
        }

        $usedFormatted = Number::fileSize((int) $totalUsedBytes);
        $maxMegabytes = $this->getMaxStorageMegabytes($config);
        $maxBytesPerDisk = $maxMegabytes * 1024 * 1024;
        $totalMaxBytes = $maxBytesPerDisk * max($reachableCount, 1);
        $percentUsed = $totalMaxBytes > 0 ? round(($totalUsedBytes / $totalMaxBytes) * 100, 1) : 0;

        $color = match (true) {
            $percentUsed >= 90 => 'danger',
            $percentUsed >= 70 => 'warning',
            default => 'success',
        };

        return Stat::make('Storage Used', $usedFormatted)
            ->description("{$percentUsed}% of ".Number::fileSize($totalMaxBytes).' limit')
            ->descriptionIcon('heroicon-m-server')
            ->color($color)
            ->chart($this->generateStorageChart($percentUsed));
    }

    /**
     * @param  Collection<int, BackupDestinationStatus>  $statuses
     */
    private function getNewestBackupStat(Collection $statuses, Config $config): Stat
    {
        $newestBackup = null;
        $newestDisk = null;

        foreach ($statuses as $status) {
            $destination = $status->backupDestination();

            if (! $destination->isReachable()) {
                continue;
            }

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
        $maxAgeDays = $this->getMaxAgeDays($config);

        $color = match (true) {
            $ageInDays > $maxAgeDays => 'danger',
            $ageInDays > ($maxAgeDays * 0.75) => 'warning',
            default => 'success',
        };

        $ageDescription = $ageInDays < 1
            ? 'Less than 1 day old'
            : round($ageInDays, 1).' day(s) old';

        return Stat::make('Newest Backup', $ageFormatted)
            ->description($this->getDiskLabel($newestDisk).' • '.$ageDescription)
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

    private function getMaxAgeDays(Config $config): int
    {
        return $config->monitoredBackups->monitorBackups[0]['healthChecks'][MaximumAgeInDays::class] ?? 1;
    }

    private function getMaxStorageMegabytes(Config $config): int
    {
        return $config->monitoredBackups->monitorBackups[0]['healthChecks'][MaximumStorageInMegabytes::class] ?? 5000;
    }

    /**
     * @return array<int>
     */
    private function generateStorageChart(float $percentUsed): array
    {
        $points = 7;
        $chart = [];

        for ($i = 0; $i < $points; $i++) {
            $chart[] = (int) min(10, max(1, $percentUsed / 10));
        }

        return $chart;
    }

    /**
     * @return array<Stat>
     */
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
