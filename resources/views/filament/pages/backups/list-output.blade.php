<div class="space-y-2">
    <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <x-heroicon-o-command-line class="w-4 h-4" />
        <span>Output from <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">backup:list</code></span>
    </div>
    <div class="p-4 bg-gray-900 dark:bg-gray-950 rounded-lg text-gray-200 font-mono text-sm overflow-x-auto border border-gray-700">
        <pre class="whitespace-pre-wrap leading-relaxed">{{ $output }}</pre>
    </div>
</div>
