@props([
    'variant' => 'primary',
    'href' => null,
    'type' => 'button',
    'size' => 'md'
])

@php
    $baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 rounded-full";
    
    $sizeClasses = [
        'sm' => 'h-8 px-4 text-xs',
        'md' => 'h-10 px-6',
        'lg' => 'h-12 px-8 text-base'
    ][$size] ?? 'h-10 px-6';
    
    $variantClasses = [
        'primary' => 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600',
        'secondary' => 'bg-white hover:bg-slate-50 text-blue-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 shadow-md hover:shadow-lg dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-400 dark:hover:text-blue-300 dark:border-slate-700 dark:hover:border-slate-600',
        'outlined' => 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300',
        'text' => 'text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300',
    ][$variant] ?? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600';
    
    $classes = $baseClasses . ' ' . $sizeClasses . ' ' . $variantClasses;
@endphp

@if ($href)
    <a href="{{ $href }}" {{ $attributes->merge(['class' => $classes]) }}>
        {{ $slot }}
    </a>
@else
    <button type="{{ $type }}" {{ $attributes->merge(['class' => $classes]) }}>
        {{ $slot }}
    </button>
@endif