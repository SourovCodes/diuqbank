import { Head } from '@inertiajs/react';
import { Activity, Cpu, Database, HardDrive, Server, Settings } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import type { ServerStatusData } from '@/types/server-status';

const formatBytes = (bytes: number | null) => {
    if (bytes === null) {
        return 'N/A';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};

const formatPercent = (value: number | null) => {
    if (value === null) {
        return 'N/A';
    }

    return `${value.toFixed(1)}%`;
};

const formatSeconds = (seconds: number | null) => {
    if (seconds === null) {
        return 'N/A';
    }

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [] as string[];

    if (days > 0) {
        parts.push(`${days}d`);
    }

    if (hours > 0 || days > 0) {
        parts.push(`${hours}h`);
    }

    parts.push(`${minutes}m`);

    return parts.join(' ');
};

const renderValue = (value: string | number | null) => {
    if (value === null || value === '') {
        return 'N/A';
    }

    return value;
};

export default function ServerStatus({ generatedAt, system, load, cpu, memory, disk, runtime, config }: ServerStatusData) {
    return (
        <DashboardLayout>
            <Head title="Server Status" />

            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Server Status</h1>
                    <p className="text-muted-foreground">Snapshot generated at {new Date(generatedAt).toLocaleString()}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System</CardTitle>
                            <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Hostname</span>
                                <span className="font-medium">{renderValue(system.hostname)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">OS</span>
                                <span className="font-medium">{renderValue(system.os)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Kernel</span>
                                <span className="font-medium">{renderValue(system.kernel)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Architecture</span>
                                <span className="font-medium">{renderValue(system.architecture)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Uptime</span>
                                <span className="font-medium">{formatSeconds(system.uptime_seconds)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Load Average</CardTitle>
                            <Activity className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">1 min</span>
                                <span className="font-medium">{renderValue(load.one)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">5 min</span>
                                <span className="font-medium">{renderValue(load.five)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">15 min</span>
                                <span className="font-medium">{renderValue(load.fifteen)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">CPU</CardTitle>
                            <Cpu className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Model</span>
                                <span className="font-medium">{renderValue(cpu.model)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Cores</span>
                                <span className="font-medium">{renderValue(cpu.cores)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Usage</span>
                                <span className="font-medium">{formatPercent(cpu.usage_percent)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Memory</CardTitle>
                            <Database className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-medium">{formatBytes(memory.total)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Used</span>
                                <span className="font-medium">{formatBytes(memory.used)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Available</span>
                                <span className="font-medium">{formatBytes(memory.available)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Disk</CardTitle>
                            <HardDrive className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="text-xs font-semibold uppercase text-muted-foreground">Base path</div>
                                <div className="text-xs text-muted-foreground">{disk.base.path}</div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total</span>
                                    <span className="font-medium">{formatBytes(disk.base.total)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Used</span>
                                    <span className="font-medium">{formatBytes(disk.base.used)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Free</span>
                                    <span className="font-medium">{formatBytes(disk.base.free)}</span>
                                </div>
                            </div>
                            <div className="space-y-2 border-t pt-3">
                                <div className="text-xs font-semibold uppercase text-muted-foreground">Storage path</div>
                                <div className="text-xs text-muted-foreground">{disk.storage.path}</div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total</span>
                                    <span className="font-medium">{formatBytes(disk.storage.total)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Used</span>
                                    <span className="font-medium">{formatBytes(disk.storage.used)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Free</span>
                                    <span className="font-medium">{formatBytes(disk.storage.free)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Runtime</CardTitle>
                            <Settings className="h-4 w-4 text-slate-600" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">App</span>
                                <span className="font-medium">{renderValue(config.app_name)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Environment</span>
                                <span className="font-medium">{renderValue(config.env)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Server</span>
                                <span className="font-medium">{renderValue(config.server_software)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">PHP</span>
                                <span className="font-medium">{runtime.php_version} ({runtime.php_sapi})</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Laravel</span>
                                <span className="font-medium">{runtime.laravel_version}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Timezone</span>
                                <span className="font-medium">{renderValue(runtime.timezone)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Memory limit</span>
                                <span className="font-medium">{renderValue(config.memory_limit)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Post max size</span>
                                <span className="font-medium">{renderValue(config.post_max_size)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Upload max size</span>
                                <span className="font-medium">{renderValue(config.upload_max_filesize)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Max exec time</span>
                                <span className="font-medium">{renderValue(config.max_execution_time)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Extensions</span>
                                <span className="font-medium">{config.extensions_count}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

ServerStatus.layout = null;
