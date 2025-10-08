<header class="border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between gap-4 py-4">
            <a href="/" class="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white">DB</span>
                <span>{{ config('app.name', 'DiuqBank') }}</span>
            </a>

            <button type="button" class="inline-flex items-center justify-center rounded-full border border-neutral-200 p-2 text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 sm:hidden"
                data-navbar-toggle aria-controls="primary-navigation" aria-expanded="false">
                <span class="sr-only">Toggle navigation</span>
                <span class="flex flex-col items-center justify-center gap-1.5">
                    <span class="block h-0.5 w-5 bg-current"></span>
                    <span class="block h-0.5 w-5 bg-current"></span>
                    <span class="block h-0.5 w-5 bg-current"></span>
                </span>
            </button>

            <div class="hidden items-center gap-6 sm:flex">
                <nav class="flex items-center gap-6 text-sm font-medium text-neutral-600" aria-label="Primary">
                    <a href="#how-it-works" class="transition-colors hover:text-neutral-900">How it works</a>
                    <a href="#stats" class="transition-colors hover:text-neutral-900">Stats</a>
                    <a href="#features" class="transition-colors hover:text-neutral-900">Features</a>
                </nav>

                <a href="#cta"
                    class="inline-flex items-center gap-2 rounded-full border border-neutral-900 px-4 py-2 text-sm font-semibold tracking-tight text-neutral-900 transition hover:bg-neutral-900 hover:text-white">
                    Get started
                </a>
            </div>
        </div>

        <div id="primary-navigation" class="flex flex-col gap-4 border-t border-neutral-200 pt-4 sm:hidden" data-navbar-menu hidden>
            <nav aria-label="Primary" class="flex flex-col gap-3 text-sm font-medium text-neutral-600">
                <a href="#how-it-works" class="transition-colors hover:text-neutral-900">How it works</a>
                <a href="#stats" class="transition-colors hover:text-neutral-900">Stats</a>
                <a href="#features" class="transition-colors hover:text-neutral-900">Features</a>
            </nav>

            <a href="#cta"
                class="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-900 px-4 py-2 text-sm font-semibold tracking-tight text-neutral-900 transition hover:bg-neutral-900 hover:text-white">
                Get started
            </a>
        </div>
    </div>

    @once
        @push('scripts')
            <script>
                window.addEventListener('DOMContentLoaded', () => {
                    document.querySelectorAll('[data-navbar-toggle]').forEach((button) => {
                        const targetId = button.getAttribute('aria-controls');
                        if (!targetId) {
                            return;
                        }

                        const menu = document.getElementById(targetId);
                        if (!menu) {
                            return;
                        }

                        const closeMenu = () => {
                            button.setAttribute('aria-expanded', 'false');
                            menu.setAttribute('hidden', 'hidden');
                        };

                        button.addEventListener('click', () => {
                            const expanded = button.getAttribute('aria-expanded') === 'true';
                            button.setAttribute('aria-expanded', (!expanded).toString());
                            if (expanded) {
                                menu.setAttribute('hidden', 'hidden');
                            } else {
                                menu.removeAttribute('hidden');
                            }
                        });

                        window.addEventListener('resize', () => {
                            if (window.innerWidth >= 640) {
                                closeMenu();
                            }
                        });
                    });
                });
            </script>
        @endpush
    @endonce
</header>
