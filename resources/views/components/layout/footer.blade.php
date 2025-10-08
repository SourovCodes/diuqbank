<footer class="border-t border-neutral-200 bg-white/90">
    <div class="container mx-auto flex flex-col gap-4 px-4 py-6 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:px-8">
        <p>&copy; {{ now()->year }} {{ config('app.name', 'DiuqBank') }}. All rights reserved.</p>
        <div class="flex items-center gap-4">
            <a href="#" class="transition-colors hover:text-neutral-900">Privacy</a>
            <a href="#" class="transition-colors hover:text-neutral-900">Terms</a>
            <a href="mailto:hello@example.com" class="transition-colors hover:text-neutral-900">Contact</a>
        </div>
    </div>
</footer>
