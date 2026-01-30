<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\BackupDestinationsWidget;
use App\Models\User;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Forms\Components\Radio;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\EmbeddedTable;
use Filament\Schemas\Schema;
use Filament\Support\Enums\Alignment;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Number;
use Spatie\Backup\BackupDestination\Backup;
use Spatie\Backup\BackupDestination\BackupDestination;
use Spatie\Backup\Config\Config;
use Spatie\Backup\Tasks\Monitor\BackupDestinationStatusFactory;

class Backups extends Page implements HasTable
{
    use InteractsWithTable;

    protected static string $routePath = '/backups';

    protected static string|\UnitEnum|null $navigationGroup = 'System';

    protected static ?int $navigationSort = 100;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-circle-stack';

    public static function canAccess(): bool
    {
        /** @var User|null $user */
        $user = auth()->user();

        return $user?->email === 'sourov2305101004@diu.edu.bd';
    }

    public function getTitle(): string|Htmlable
    {
        return 'Backups';
    }

    public static function getNavigationLabel(): string
    {
        return 'Backups';
    }

    public static function getNavigationBadge(): ?string
    {
        try {
            $config = app(Config::class);
            $statuses = BackupDestinationStatusFactory::createForMonitorConfig($config->monitoredBackups);

            $total = $statuses->sum(
                fn ($status) => $status->backupDestination()->backups()->count()
            );

            return $total > 0 ? (string) $total : null;
        } catch (\Exception) {
            return null;
        }
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'info';
    }

    public static function getNavigationBadgeTooltip(): ?string
    {
        return 'Total backups stored';
    }

    protected function getHeaderWidgets(): array
    {
        return [
            BackupDestinationsWidget::class,
        ];
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('refresh')
                ->label('Refresh')
                ->icon(Heroicon::ArrowPath)
                ->color('gray')
                ->iconButton()
                ->tooltip('Refresh backup list'),

            ActionGroup::make([
                Action::make('run_monitor')
                    ->label('Check Health')
                    ->icon(Heroicon::OutlinedHeart)
                    ->color('info')
                    ->action(fn () => $this->runHealthCheck()),

                Action::make('run_cleanup')
                    ->label('Run Cleanup')
                    ->icon(Heroicon::OutlinedTrash)
                    ->color('warning')
                    ->requiresConfirmation()
                    ->modalIcon(Heroicon::OutlinedTrash)
                    ->modalIconColor('warning')
                    ->modalHeading('Run Backup Cleanup')
                    ->modalDescription('This will remove old backups according to your retention policy. Recent backups will be preserved.')
                    ->modalSubmitActionLabel('Run Cleanup')
                    ->action(fn () => $this->runCleanup()),

                Action::make('list_backups')
                    ->label('View CLI Details')
                    ->icon(Heroicon::OutlinedCommandLine)
                    ->color('gray')
                    ->modalContent(fn () => $this->getBackupListOutput())
                    ->modalHeading('Backup CLI Output')
                    ->modalSubmitAction(false)
                    ->modalCancelActionLabel('Close'),
            ])
                ->label('Tools')
                ->icon(Heroicon::OutlinedWrenchScrewdriver)
                ->color('gray')
                ->button(),

            Action::make('create_backup')
                ->label('Create Backup')
                ->icon(Heroicon::Plus)
                ->schema([
                    Radio::make('option')
                        ->label('What would you like to backup?')
                        ->options([
                            'default' => 'Everything (Files & Database)',
                            'only-db' => 'Database Only',
                            'only-files' => 'Files Only',
                        ])
                        ->descriptions([
                            'default' => 'Includes all configured files and database dumps',
                            'only-db' => 'Only creates a database dump',
                            'only-files' => 'Only backs up configured directories',
                        ])
                        ->default('default')
                        ->required(),
                ])
                ->modalHeading('Create New Backup')
                ->modalDescription('Select the type of backup you want to create. This process may take a few minutes.')
                ->modalIcon(Heroicon::OutlinedCloudArrowUp)
                ->modalSubmitActionLabel('Start Backup')
                ->modalFooterActionsAlignment(Alignment::End)
                ->action(fn (array $data) => $this->createBackup($data['option'])),
        ];
    }

    public function content(Schema $schema): Schema
    {
        return $schema->components([
            EmbeddedTable::make(),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->heading('All Backups')
            ->description('Individual backup files across all destinations')
            ->paginated([10, 25, 50, 100])
            ->defaultPaginationPageOption(10)
            ->striped()
            ->poll('30s')
            ->deferLoading()
            ->defaultSort('date', 'desc')
            ->records(function (int $page, int $recordsPerPage): LengthAwarePaginator {
                $allRecords = collect($this->getBackupRecords());

                return new LengthAwarePaginator(
                    items: $allRecords->forPage($page, $recordsPerPage),
                    total: $allRecords->count(),
                    perPage: $recordsPerPage,
                    currentPage: $page,
                );
            })
            ->resolveSelectedRecordsUsing(function (array $keys): \Illuminate\Support\Collection {
                $allRecords = $this->getBackupRecords();

                return collect(array_filter($allRecords, fn (array $record): bool => in_array($record['path'], $keys, true)));
            })
            ->columns([
                IconColumn::make('health')
                    ->label('')
                    ->icon(fn (array $record): string => $record['is_healthy'] ? 'heroicon-o-check-circle' : 'heroicon-o-exclamation-circle')
                    ->color(fn (array $record): string => $record['is_healthy'] ? 'success' : 'warning')
                    ->tooltip(fn (array $record): string => $record['is_healthy'] ? 'Healthy backup' : 'Backup may be too old'),

                TextColumn::make('filename')
                    ->label('Backup File')
                    ->description(fn (array $record): string => $record['path'])
                    ->searchable(query: fn (array $record, string $search): bool => str_contains(
                        strtolower($record['path']),
                        strtolower($search)
                    ))
                    ->wrap(),

                TextColumn::make('disk_label')
                    ->label('Storage')
                    ->badge()
                    ->color(fn (array $record): string => $this->getDiskColor($record['disk']))
                    ->icon(fn (array $record): string => $this->getDiskIcon($record['disk'])),

                TextColumn::make('date')
                    ->label('Created')
                    ->since()
                    ->dateTimeTooltip()
                    ->sortable(query: fn (array $records, string $direction): array => $direction === 'asc'
                        ? array_reverse($records, true)
                        : $records
                    ),

                TextColumn::make('age')
                    ->label('Age')
                    ->badge()
                    ->color(fn (array $record): string => $this->getAgeColor($record['age_days']))
                    ->tooltip(fn (array $record): string => "Created: {$record['date']}"),

                TextColumn::make('size')
                    ->label('Size')
                    ->badge()
                    ->color(fn (array $record): string => $this->getSizeColor($record['size_raw'])),
            ])
            ->recordActions([
                Action::make('download')
                    ->label('Download')
                    ->icon(Heroicon::ArrowDownTray)
                    ->color('gray')
                    ->iconButton()
                    ->tooltip('Download backup')
                    ->url(fn (array $record): string => $this->getDownloadUrl($record))
                    ->openUrlInNewTab(),

                Action::make('delete')
                    ->label('Delete')
                    ->icon(Heroicon::Trash)
                    ->color('danger')
                    ->iconButton()
                    ->tooltip('Delete backup')
                    ->requiresConfirmation()
                    ->modalIcon(Heroicon::OutlinedTrash)
                    ->modalIconColor('danger')
                    ->modalHeading('Delete Backup')
                    ->modalDescription(fn (array $record): string => "Are you sure you want to permanently delete this backup?\n\n{$record['path']}")
                    ->modalSubmitActionLabel('Delete Backup')
                    ->action(fn (array $record) => $this->deleteBackup($record)),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('delete')
                        ->label('Delete Selected')
                        ->icon(Heroicon::Trash)
                        ->color('danger')
                        ->requiresConfirmation()
                        ->modalIcon(Heroicon::OutlinedTrash)
                        ->modalIconColor('danger')
                        ->modalHeading('Delete Selected Backups')
                        ->modalDescription(fn (\Illuminate\Support\Collection $records): string => 'Are you sure you want to permanently delete '.$records->count().' selected backup(s)?')
                        ->modalSubmitActionLabel('Delete Backups')
                        ->action(fn (\Illuminate\Support\Collection $records) => $this->deleteBackups($records->all()))
                        ->deselectRecordsAfterCompletion(),
                ]),
            ])
            ->emptyStateHeading('No Backups Yet')
            ->emptyStateDescription('Create your first backup to protect your data.')
            ->emptyStateIcon(Heroicon::OutlinedShieldExclamation)
            ->emptyStateActions([
                Action::make('create_first_backup')
                    ->label('Create Your First Backup')
                    ->icon(Heroicon::Plus)
                    ->action(fn () => $this->mountAction('create_backup')),
            ]);
    }

    private function getBackupRecords(): array
    {
        try {
            $config = app(Config::class);
            $maxAgeDays = $this->getMaxAgeDays($config);
            $result = [];

            $statuses = BackupDestinationStatusFactory::createForMonitorConfig($config->monitoredBackups);

            foreach ($statuses as $status) {
                $destination = $status->backupDestination();

                if (! $destination->isReachable()) {
                    continue;
                }

                foreach ($destination->backups() as $backup) {
                    $date = $backup->date();
                    $ageDays = round($date->diffInMinutes() / (24 * 60), 2);
                    $path = $backup->path();

                    // Use path as key for record identification
                    $result[$path] = [
                        'path' => $path,
                        'filename' => basename($path),
                        'disk' => $destination->diskName(),
                        'disk_label' => $this->getDiskLabel($destination->diskName()),
                        'date' => $date->toDateTimeString(),
                        'age' => $this->formatAge($ageDays),
                        'age_days' => $ageDays,
                        'size' => Number::fileSize($backup->sizeInBytes()),
                        'size_raw' => $backup->sizeInBytes(),
                        'is_healthy' => $ageDays <= $maxAgeDays,
                    ];
                }
            }

            // Sort by date descending
            uasort($result, fn (array $a, array $b): int => strcmp($b['date'], $a['date']));

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

    private function getDiskColor(string $disk): string
    {
        return match ($disk) {
            'backups' => 'info',
            'local-backups' => 'warning',
            default => 'gray',
        };
    }

    private function getDiskIcon(string $disk): string
    {
        return match ($disk) {
            'backups' => 'heroicon-o-cloud',
            'local-backups' => 'heroicon-o-server',
            default => 'heroicon-o-circle-stack',
        };
    }

    private function getAgeColor(float $ageDays): string
    {
        return match (true) {
            $ageDays > 7 => 'danger',
            $ageDays > 1 => 'warning',
            default => 'success',
        };
    }

    private function getSizeColor(int $sizeBytes): string
    {
        return match (true) {
            $sizeBytes > 500 * 1024 * 1024 => 'danger',
            $sizeBytes > 100 * 1024 * 1024 => 'warning',
            default => 'success',
        };
    }

    private function getMaxAgeDays(Config $config): int
    {
        return $config->monitoredBackups->monitorBackups[0]['healthChecks'][\Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumAgeInDays::class] ?? 1;
    }

    private function formatAge(float $days): string
    {
        if ($days < 1) {
            $hours = round($days * 24, 1);

            return $hours <= 1 ? 'Less than 1 hour' : "{$hours} hours";
        }

        if ($days < 7) {
            $roundedDays = round($days, 1);

            return $roundedDays == 1 ? '1 day' : "{$roundedDays} days";
        }

        $weeks = round($days / 7, 1);

        return $weeks == 1 ? '1 week' : "{$weeks} weeks";
    }

    private function runHealthCheck(): void
    {
        try {
            $exitCode = Artisan::call('backup:monitor');

            if ($exitCode === 0) {
                Notification::make()
                    ->title('Health Check Passed')
                    ->body('All backup health checks are passing.')
                    ->success()
                    ->send();
            } else {
                Notification::make()
                    ->title('Health Check Warning')
                    ->body('One or more backup health checks failed. Review your backup configuration.')
                    ->warning()
                    ->send();
            }
        } catch (\Exception $e) {
            Notification::make()
                ->title('Health Check Failed')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }

    private function runCleanup(): void
    {
        try {
            Artisan::call('backup:clean');

            Notification::make()
                ->title('Cleanup Complete')
                ->body('Old backups have been removed according to retention policy.')
                ->success()
                ->send();
        } catch (\Exception $e) {
            Notification::make()
                ->title('Cleanup Failed')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }

    private function getBackupListOutput(): \Illuminate\Contracts\View\View
    {
        try {
            Artisan::call('backup:list');
            $output = Artisan::output();
        } catch (\Exception $e) {
            $output = 'Failed to retrieve backup list: '.$e->getMessage();
        }

        return view('filament.pages.backups.list-output', ['output' => $output]);
    }

    private function createBackup(string $option): void
    {
        try {
            $params = match ($option) {
                'only-db' => ['--only-db' => true],
                'only-files' => ['--only-files' => true],
                default => [],
            };

            Artisan::call('backup:run', $params);

            Notification::make()
                ->title('Backup Complete')
                ->body('Your backup has been created successfully.')
                ->success()
                ->send();
        } catch (\Exception $e) {
            Notification::make()
                ->title('Backup Failed')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }

    private function getDownloadUrl(array $record): string
    {
        try {
            /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
            $disk = Storage::disk($record['disk']);

            return $disk->temporaryUrl(
                $record['path'],
                now()->addMinutes(5)
            );
        } catch (\Exception) {
            Notification::make()
                ->title('Download Failed')
                ->body('Unable to generate download URL.')
                ->danger()
                ->send();

            return '#';
        }
    }

    private function deleteBackup(array $record): void
    {
        try {
            $backupDestination = BackupDestination::create(
                $record['disk'],
                config('backup.backup.name')
            );

            $backup = $backupDestination->backups()->first(
                fn (Backup $backup): bool => $backup->path() === $record['path']
            );

            if ($backup) {
                $backup->delete();

                Notification::make()
                    ->title('Backup Deleted')
                    ->body('The backup has been permanently removed.')
                    ->success()
                    ->send();
            }
        } catch (\Exception $e) {
            Notification::make()
                ->title('Delete Failed')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }

    private function deleteBackups(array $records): void
    {
        $deleted = 0;
        $failed = 0;

        foreach ($records as $record) {
            try {
                $backupDestination = BackupDestination::create(
                    $record['disk'],
                    config('backup.backup.name')
                );

                $backup = $backupDestination->backups()->first(
                    fn (Backup $backup): bool => $backup->path() === $record['path']
                );

                if ($backup) {
                    $backup->delete();
                    $deleted++;
                }
            } catch (\Exception) {
                $failed++;
            }
        }

        if ($deleted > 0 && $failed === 0) {
            Notification::make()
                ->title('Backups Deleted')
                ->body("{$deleted} backup(s) have been permanently removed.")
                ->success()
                ->send();
        } elseif ($deleted > 0 && $failed > 0) {
            Notification::make()
                ->title('Partial Success')
                ->body("{$deleted} backup(s) deleted, {$failed} failed.")
                ->warning()
                ->send();
        } else {
            Notification::make()
                ->title('Delete Failed')
                ->body('Failed to delete the selected backups.')
                ->danger()
                ->send();
        }
    }
}
