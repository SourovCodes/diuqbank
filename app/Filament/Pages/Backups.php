<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\BackupsStats;
use App\Models\User;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Forms\Components\Radio;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\EmbeddedTable;
use Filament\Schemas\Schema;
use Filament\Support\Enums\Alignment;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Number;
use Spatie\Backup\BackupDestination\Backup;
use Spatie\Backup\BackupDestination\BackupDestination;
use UnitEnum;

class Backups extends Page implements HasTable
{
    use InteractsWithTable;

    protected static string $routePath = '/backups';

    protected static UnitEnum|string|null $navigationGroup = 'System';

    protected static ?int $navigationSort = 100;

    public static function getNavigationIcon(): string|BackedEnum|Htmlable|null
    {
        return Heroicon::OutlinedCircleStack;
    }

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
            $disks = config('backup.backup.destination.disks', ['backups']);
            $backupName = config('backup.backup.name');
            $total = 0;

            foreach ($disks as $disk) {
                $backupDestination = BackupDestination::create($disk, $backupName);
                $total += $backupDestination->backups()->count();
            }

            return (string) $total;
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
            BackupsStats::class,
        ];
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('refresh')
                ->label('Refresh')
                ->icon(Heroicon::ArrowPath)
                ->color('gray')
                ->action(fn () => null),

            ActionGroup::make([
                Action::make('run_monitor')
                    ->label('Check Health')
                    ->icon(Heroicon::OutlinedHeart)
                    ->color('info')
                    ->action(function (): void {
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
                    }),

                Action::make('run_cleanup')
                    ->label('Run Cleanup')
                    ->icon(Heroicon::OutlinedTrash)
                    ->color('warning')
                    ->requiresConfirmation()
                    ->modalIcon(Heroicon::OutlinedTrash)
                    ->modalHeading('Run Backup Cleanup')
                    ->modalDescription('This will remove old backups according to your retention policy. Recent backups will be preserved.')
                    ->modalSubmitActionLabel('Run Cleanup')
                    ->action(function (): void {
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
                    }),

                Action::make('list_backups')
                    ->label('View Details')
                    ->icon(Heroicon::OutlinedListBullet)
                    ->color('gray')
                    ->modalContent(function () {
                        try {
                            Artisan::call('backup:list');
                            $output = Artisan::output();

                            return view('filament.pages.backups.list-output', [
                                'output' => $output,
                            ]);
                        } catch (\Exception $e) {
                            return view('filament.pages.backups.list-output', [
                                'output' => 'Failed to retrieve backup list: '.$e->getMessage(),
                            ]);
                        }
                    })
                    ->modalHeading('Backup Details')
                    ->modalSubmitAction(false)
                    ->modalCancelActionLabel('Close'),
            ])
                ->label('Tools')
                ->icon(Heroicon::Wrench)
                ->color('gray')
                ->button(),

            Action::make('create_backup')
                ->label('Create Backup')
                ->icon(Heroicon::Plus)
                ->form([
                    Radio::make('option')
                        ->label('What would you like to backup?')
                        ->options([
                            'default' => 'Everything (Files & Database)',
                            'only-db' => 'Database Only',
                            'only-files' => 'Files Only',
                        ])
                        ->default('default')
                        ->required(),
                ])
                ->modalHeading('Create New Backup')
                ->modalDescription('Select the type of backup you want to create. This process may take a few minutes.')
                ->modalIcon(Heroicon::OutlinedCloudArrowUp)
                ->modalSubmitActionLabel('Start Backup')
                ->modalFooterActionsAlignment(Alignment::End)
                ->action(function (array $data): void {
                    $option = $data['option'];

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
                }),
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
            ->paginated(false)
            ->striped()
            ->poll('30s')
            ->deferLoading()
            ->records(fn (): array => $this->getBackupRecords())
            ->columns([
                TextColumn::make('filename')
                    ->label('Backup File')
                    ->icon(Heroicon::OutlinedArchiveBox)
                    ->description(fn (array $record): string => $record['path'])
                    ->searchable(query: fn (array $record, string $search): bool => str_contains(strtolower($record['path']), strtolower($search))),

                TextColumn::make('disk_label')
                    ->label('Storage')
                    ->badge()
                    ->color(fn (array $record): string => match ($record['disk']) {
                        'backups' => 'info',
                        'local-backups' => 'warning',
                        default => 'gray',
                    })
                    ->icon(fn (array $record): string => match ($record['disk']) {
                        'backups' => 'heroicon-o-cloud',
                        'local-backups' => 'heroicon-o-server',
                        default => 'heroicon-o-circle-stack',
                    }),

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
                    ->color(fn (array $record): string => match (true) {
                        $record['age_days'] > 7 => 'danger',
                        $record['age_days'] > 1 => 'warning',
                        default => 'success',
                    })
                    ->tooltip(fn (array $record): string => "Created: {$record['date']}"),

                TextColumn::make('size')
                    ->label('Size')
                    ->badge()
                    ->color(fn (array $record): string => match (true) {
                        $record['size_raw'] > 500 * 1024 * 1024 => 'danger',
                        $record['size_raw'] > 100 * 1024 * 1024 => 'warning',
                        default => 'success',
                    }),
            ])
            ->recordActions([
                ActionGroup::make([
                    Action::make('download')
                        ->label('Download')
                        ->icon(Heroicon::ArrowDownTray)
                        ->color('primary')
                        ->url(fn (array $record): string => $this->getDownloadUrl($record))
                        ->openUrlInNewTab(),

                    Action::make('delete')
                        ->label('Delete')
                        ->icon(Heroicon::Trash)
                        ->color('danger')
                        ->requiresConfirmation()
                        ->modalIcon(Heroicon::OutlinedTrash)
                        ->modalIconColor('danger')
                        ->modalHeading('Delete Backup')
                        ->modalDescription(fn (array $record): string => "Are you sure you want to permanently delete this backup?\n\n{$record['path']}")
                        ->modalSubmitActionLabel('Delete Backup')
                        ->action(fn (array $record) => $this->deleteBackup($record)),
                ])
                    ->icon(Heroicon::EllipsisVertical)
                    ->tooltip('Actions'),
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
        $disks = config('backup.backup.destination.disks', ['backups']);
        $backupName = config('backup.backup.name');
        $result = [];

        foreach ($disks as $disk) {
            try {
                $backupDestination = BackupDestination::create($disk, $backupName);
                $backups = $backupDestination->backups();

                foreach ($backups as $backup) {
                    $date = $backup->date();
                    $ageDays = round($date->diffInMinutes() / (24 * 60), 2);

                    $result[] = [
                        'path' => $backup->path(),
                        'filename' => basename($backup->path()),
                        'disk' => $disk,
                        'disk_label' => $this->getDiskLabel($disk),
                        'date' => $date->toDateTimeString(),
                        'age' => $this->formatAge($ageDays),
                        'age_days' => $ageDays,
                        'size' => Number::fileSize($backup->sizeInBytes()),
                        'size_raw' => $backup->sizeInBytes(),
                    ];
                }
            } catch (\Exception) {
                // Continue to next disk if one fails
                continue;
            }
        }

        // Sort by date descending (newest first)
        usort($result, fn (array $a, array $b): int => strcmp($b['date'], $a['date']));

        return $result;
    }

    private function getDiskLabel(string $disk): string
    {
        return match ($disk) {
            'backups' => 'S3 Cloud',
            'local-backups' => 'Local',
            default => ucfirst($disk),
        };
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

    private function getDownloadUrl(array $record): string
    {
        try {
            return Storage::disk($record['disk'])->temporaryUrl(
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
}
