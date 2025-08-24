<?php

use App\Helpers\ToastHelper;

if (!function_exists('toast')) {
    /**
     * Flash a toast message
     *
     * @param string $message
     * @param string $type (success, error, warning, info)
     * @return void
     */
    function toast(string $message, string $type = 'success'): void
    {
        match ($type) {
            'success' => ToastHelper::success($message),
            'error' => ToastHelper::error($message),
            'warning' => ToastHelper::warning($message),
            'info' => ToastHelper::info($message),
            default => ToastHelper::success($message),
        };
    }
}
