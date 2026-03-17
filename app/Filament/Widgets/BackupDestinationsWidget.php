<?php

namespace App\Filament\Widgets;

use Filament\Support\Enums\FontWeight;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use Illuminate\Support\Number;
use Spatie\Backup\Config\Config;
use Spatie\Backup\Tasks\Monitor\BackupDestinationStatusFactory;

class BackupDestinationsWidget extends TableWidget
{
    protected static ?int $sort = 1;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $pollingInterval = '30s';

    public function table(Table $table): Table
    {
        return $table
            ->heading('Backup Destinations')
            ->description('Overview of all configured backup storage locations')
            ->paginated(false)
            ->striped()
            ->records(fn (): array => $this->getDestinationRecords())
            ->columns([
                TextColumn::make('name')
                    ->label('Name')
                    ->weight(fn (array $record): FontWeight => $record['is_summary'] ? FontWeight::Bold : FontWeight::SemiBold)
                    ->icon(fn (array $record): ?string => $record['is_summary'] ? 'heroicon-o-calculator' : 'heroicon-o-archive-box')
                    ->color(fn (array $record): ?string => $record['is_summary'] ? 'primary' : null),

                TextColumn::make('disk_label')
                    ->label('Disk')
                    ->badge()
                    ->color(fn (array $record): string => match (true) {
                        $record['is_summary'] => 'gray',
                        $record['disk'] === 'backups' => 'info',
                        $record['disk'] === 'local-backups' => 'warning',
                        default => 'gray',
                    })
                    ->icon(fn (array $record): ?string => match (true) {
                        $record['is_summary'] => null,
                        $record['disk'] === 'backups' => 'heroicon-o-cloud',
                        $record['disk'] === 'local-backups' => 'heroicon-o-server',
                        default => 'heroicon-o-circle-stack',
                    }),

                IconColumn::make('is_healthy')
                    ->label('Healthy')
                    ->icon(fn (array $record): string => match (true) {
                        $record['is_summary'] && $record['is_healthy'] => 'heroicon-o-check-badge',
                        $record['is_summary'] && ! $record['is_healthy'] => 'heroicon-o-exclamation-triangle',
                        $record['is_healthy'] => 'heroicon-o-check-circle',
                        default => 'heroicon-o-x-circle',
                    })
                    ->color(fn (array $record): string => $record['is_healthy'] ? 'success' : 'danger'),

                TextColumn::make('amount')
                    ->label('Backups')
                    ->badge()
                    ->color(fn (array $record): string => match (true) {
                        $record['is_summary'] => 'primary',
                        $record['amount'] > 0 => 'success',
                        default => 'warning',
                    }),

                TextColumn::make('newest')
                    ->label('Newest')
                    ->icon('heroicon-o-clock')
                    ->color(fn (array $record): string => match (true) {
                        $record['newest'] === 'No backups' => 'danger',
                        $record['newest_minutes'] <= 60 => 'success',
                        $record['newest_minutes'] <= 1440 => 'warning',
                        default => 'danger',
                    }),

                TextColumn::make('used_storage')
                    ->label('Used Storage')
                    ->badge()
                    ->color(fn (array $record): string => match (true) {
                        $record['is_summary'] => 'primary',
                        $record['used_storage_raw'] > 1024 * 1024 * 1024 => 'danger',
                        $record['used_storage_raw'] > 500 * 1024 * 1024 => 'warning',
                        $record['used_storage_raw'] > 100 * 1024 * 1024 => 'info',
                        default => 'success',
                    }),
            ])
            ->emptyStateHeading('No Destinations Configured')
            ->emptyStateDescription('Configure backup destinations in your backup config.')
            ->emptyStateIcon('heroicon-o-cog-6-tooth');
    }

    private function getDestinationRecords(): array
    {
        try {
            $config = app(Config::class);
            $result = [];
            $totalBackups = 0;
            $totalStorage = 0;
            $allHealthy = true;
            $newestOverall = null;
            $newestMinutesOverall = PHP_INT_MAX;

            $statuses = BackupDestinationStatusFactory::createForMonitorConfig($config->monitoredBackups);

            foreach ($statuses as $status) {
                $destination = $status->backupDestination();
                $backups = $destination->backups();
                $newestBackup = $backups->newest();

                $newestText = 'No backups';
                $newestMinutes = PHP_INT_MAX;

                if ($newestBackup) {
                    $newestMinutes = (int) $newestBackup->date()->diffInMinutes();
                    $newestText = $this->formatNewestAge($newestMinutes);

                    if ($newestMinutes < $newestMinutesOverall) {
                        $newestMinutesOverall = $newestMinutes;
                        $newestOverall = $newestText;
                    }
                }

                $backupCount = $backups->count();
                $storageUsed = $destination->usedStorage();

                $totalBackups += $backupCount;
                $totalStorage += $storageUsed;

                if (! $status->isHealthy()) {
                    $allHealthy = false;
                }

                $result[] = [
                    'name' => $destination->backupName(),
                    'disk' => $destination->diskName(),
                    'disk_label' => $this->getDiskLabel($destination->diskName()),
                    'is_healthy' => $status->isHealthy(),
                    'amount' => $backupCount,
                    'newest' => $newestText,
                    'newest_minutes' => $newestMinutes,
                    'used_storage' => Number::fileSize($storageUsed),
                    'used_storage_raw' => $storageUsed,
                    'is_summary' => false,
                ];
            }

            // Add summary row if we have destinations
            if (count($result) > 0) {
                $result[] = [
                    'name' => 'Total ('.count($result).' destinations)',
                    'disk' => 'summary',
                    'disk_label' => count($result).' disks',
                    'is_healthy' => $allHealthy,
                    'amount' => $totalBackups,
                    'newest' => $newestOverall ?? 'No backups',
                    'newest_minutes' => $newestMinutesOverall,
                    'used_storage' => Number::fileSize($totalStorage),
                    'used_storage_raw' => $totalStorage,
                    'is_summary' => true,
                ];
            }

            return $result;
        } catch (\Exception) {
            return [];
        }
    }

    private function getDiskLabel(string $disk): string
    {
        return match ($disk) {
            'backups' => 'S3 Cloud',
            'local-backups' => 'Local',
            default => ucfirst($disk),
        };
    }

    private function formatNewestAge(int $minutes): string
    {
        if ($minutes < 1) {
            return 'Just now';
        }

        if ($minutes < 60) {
            return $minutes === 1 ? '1 minute ago' : "{$minutes} minutes ago";
        }

        $hours = (int) floor($minutes / 60);
        if ($hours < 24) {
            return $hours === 1 ? '1 hour ago' : "{$hours} hours ago";
        }

        $days = (int) floor($hours / 24);
        if ($days < 7) {
            return $days === 1 ? '1 day ago' : "{$days} days ago";
        }

        $weeks = (int) floor($days / 7);

        return $weeks === 1 ? '1 week ago' : "{$weeks} weeks ago";
    }
}
