<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ServerStatusController extends Controller
{
    public function __invoke(): Response
    {
        $load = $this->readLoadAverage() ?? [];
        $memory = $this->readMemoryStats();

        return Inertia::render('server-status', [
            'generatedAt' => now()->toIso8601String(),
            'system' => [
                'hostname' => gethostname() ?: null,
                'os' => php_uname('s') ?: null,
                'kernel' => php_uname('r') ?: null,
                'architecture' => php_uname('m') ?: null,
                'uptime_seconds' => $this->readUptimeSeconds(),
            ],
            'load' => [
                'one' => $load[0] ?? null,
                'five' => $load[1] ?? null,
                'fifteen' => $load[2] ?? null,
            ],
            'cpu' => [
                'cores' => $this->readCpuCores(),
                'usage_percent' => $this->readCpuUsagePercent(),
                'model' => $this->readCpuModel(),
            ],
            'memory' => [
                'total' => $memory['total'] ?? null,
                'available' => $memory['available'] ?? null,
                'used' => $memory['used'] ?? null,
            ],
            'disk' => [
                'base' => $this->readDiskUsage(base_path()),
                'storage' => $this->readDiskUsage(storage_path()),
            ],
            'runtime' => [
                'php_version' => PHP_VERSION,
                'php_sapi' => PHP_SAPI,
                'laravel_version' => app()->version(),
                'timezone' => config('app.timezone'),
            ],
            'config' => [
                'app_name' => config('app.name'),
                'env' => app()->environment(),
                'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? null,
                'memory_limit' => ini_get('memory_limit') ?: null,
                'post_max_size' => ini_get('post_max_size') ?: null,
                'upload_max_filesize' => ini_get('upload_max_filesize') ?: null,
                'max_execution_time' => ini_get('max_execution_time') ?: null,
                'extensions_count' => count(get_loaded_extensions()),
            ],
        ]);
    }

    /**
     * @return array{path: string, total: int|null, free: int|null, used: int|null}
     */
    private function readDiskUsage(string $path): array
    {
        $total = @disk_total_space($path) ?: null;
        $free = @disk_free_space($path) ?: null;
        $used = null;

        if (is_int($total) && is_int($free)) {
            $used = $total - $free;
        }

        return [
            'path' => $path,
            'total' => is_int($total) ? $total : null,
            'free' => is_int($free) ? $free : null,
            'used' => $used,
        ];
    }

    /**
     * @return array{total: int|null, available: int|null, used: int|null}
     */
    private function readMemoryStats(): array
    {
        $content = $this->readProcFile('/proc/meminfo');

        if ($content === null) {
            return ['total' => null, 'available' => null, 'used' => null];
        }

        $values = [];

        foreach (explode("\n", trim($content)) as $line) {
            if ($line === '') {
                continue;
            }

            [$key, $value] = array_map('trim', explode(':', $line, 2));
            $parts = preg_split('/\s+/', $value);

            if (isset($parts[0])) {
                $values[$key] = (int) $parts[0] * 1024;
            }
        }

        $total = $values['MemTotal'] ?? null;
        $available = $values['MemAvailable'] ?? null;

        if ($available === null && $total !== null) {
            $free = $values['MemFree'] ?? 0;
            $buffers = $values['Buffers'] ?? 0;
            $cached = $values['Cached'] ?? 0;
            $available = $free + $buffers + $cached;
        }

        $used = null;

        if (is_int($total) && is_int($available)) {
            $used = $total - $available;
        }

        return [
            'total' => is_int($total) ? $total : null,
            'available' => is_int($available) ? $available : null,
            'used' => $used,
        ];
    }

    /**
     * @return array<int, float>|null
     */
    private function readLoadAverage(): ?array
    {
        $load = sys_getloadavg();

        if (! is_array($load) || count($load) < 3) {
            return null;
        }

        return [
            (float) $load[0],
            (float) $load[1],
            (float) $load[2],
        ];
    }

    private function readCpuUsagePercent(): ?float
    {
        $start = $this->readCpuSnapshot();

        if ($start === null) {
            return null;
        }

        usleep(100000);

        $end = $this->readCpuSnapshot();

        if ($end === null) {
            return null;
        }

        $totalDiff = $end['total'] - $start['total'];
        $idleDiff = $end['idle'] - $start['idle'];

        if ($totalDiff <= 0) {
            return null;
        }

        $usage = (1 - ($idleDiff / $totalDiff)) * 100;

        return round($usage, 1);
    }

    /**
     * @return array{total: int, idle: int}|null
     */
    private function readCpuSnapshot(): ?array
    {
        $content = $this->readProcFile('/proc/stat');

        if ($content === null) {
            return null;
        }

        $line = strtok($content, "\n");

        if (! is_string($line)) {
            return null;
        }

        $parts = preg_split('/\s+/', trim($line));

        if (! is_array($parts) || ($parts[0] ?? null) !== 'cpu') {
            return null;
        }

        $values = array_slice($parts, 1);
        $numbers = array_map('intval', $values);

        if (count($numbers) < 4) {
            return null;
        }

        $total = array_sum($numbers);
        $idle = $numbers[3] + ($numbers[4] ?? 0);

        return [
            'total' => $total,
            'idle' => $idle,
        ];
    }

    private function readCpuCores(): ?int
    {
        $content = $this->readProcFile('/proc/cpuinfo');

        if ($content !== null) {
            preg_match_all('/^processor\s*:/m', $content, $matches);

            if (! empty($matches[0])) {
                return count($matches[0]);
            }

            if (preg_match('/^cpu cores\s*:\s*(\d+)/m', $content, $coreMatch)) {
                return (int) $coreMatch[1];
            }
        }

        $env = getenv('NUMBER_OF_PROCESSORS');

        if ($env !== false) {
            return (int) $env;
        }

        return null;
    }

    private function readCpuModel(): ?string
    {
        $content = $this->readProcFile('/proc/cpuinfo');

        if ($content !== null && preg_match('/^model name\s*:\s*(.+)$/m', $content, $match)) {
            return trim($match[1]);
        }

        if ($content !== null && preg_match('/^Hardware\s*:\s*(.+)$/m', $content, $match)) {
            return trim($match[1]);
        }

        return null;
    }

    private function readUptimeSeconds(): ?int
    {
        $content = $this->readProcFile('/proc/uptime');

        if ($content === null) {
            return null;
        }

        $parts = preg_split('/\s+/', trim($content));

        if (! isset($parts[0])) {
            return null;
        }

        return (int) floor((float) $parts[0]);
    }

    private function readProcFile(string $path): ?string
    {
        if (! is_readable($path)) {
            return null;
        }

        $content = file_get_contents($path);

        if ($content === false) {
            return null;
        }

        return $content;
    }
}
