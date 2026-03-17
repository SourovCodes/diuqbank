<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class DiskStatusController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $disks = ['local', 'public', 'avatars', 'submissions', 's3', 'submissions-conversions'];
        $statuses = [];

        foreach ($disks as $disk) {
            $statuses[$disk] = $this->checkDisk($disk);
        }

        return response()->json([
            'timestamp' => now()->toIso8601String(),
            'disks' => $statuses,
        ]);
    }

    /**
     * @return array{status: string, writable: bool, readable: bool, error: string|null}
     */
    private function checkDisk(string $disk): array
    {
        $testFile = '.disk-status-check-'.uniqid();

        try {
            $storage = Storage::disk($disk);

            $writable = $storage->put($testFile, 'test');

            $readable = $writable && $storage->get($testFile) === 'test';

            if ($writable) {
                $storage->delete($testFile);
            }

            return [
                'status' => ($writable && $readable) ? 'ok' : 'degraded',
                'writable' => $writable,
                'readable' => $readable,
                'error' => null,
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'error',
                'writable' => false,
                'readable' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
