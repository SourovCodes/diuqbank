<a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md">Skip to content</a>

@php
    $navItems = [
        [ 'name' => 'Home', 'href' => url('/'), 'pattern' => '/' ],
        [ 'name' => 'Questions', 'href' => url('/questions'), 'pattern' => 'questions*' ],
        [ 'name' => 'Contributors', 'href' => url('/contributors'), 'pattern' => 'contributors*' ],
        [ 'name' => 'About', 'href' => url('/about'), 'pattern' => 'about*' ],
        [ 'name' => 'Contact', 'href' => url('/contact'), 'pattern' => 'contact*' ],
    ];
    $isActive = function(string $pattern) {
        return request()->is($pattern) || ($pattern === '/' && request()->path() === '/');
    };
@endphp

<header id="app-navbar" role="banner" class="fixed inset-x-0 top-0 z-40 backdrop-blur-md transition-colors border-b bg-white/60 dark:bg-slate-950/40 border-transparent">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <a href="{{ url('/') }}" class="group relative inline-flex items-center gap-2 focus:outline-none" aria-label="DIUQbank home">
                    <span class="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-500 text-white font-bold shadow-sm ring-1 ring-inset ring-white/20 dark:ring-slate-900/40">D</span>
                    <span class="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-500 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-200">DIUQbank</span>
                    <span class="absolute -bottom-2 left-11 hidden rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 md:inline-block">beta</span>
                </a>
            </div>

            <nav aria-label="Primary" class="hidden md:flex items-center gap-1 text-sm">
                @foreach ($navItems as $item)
                    @php $active = $isActive($item['pattern']); @endphp
                    <a href="{{ $item['href'] }}" aria-current="{{ $active ? 'page' : '' }}" class="relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 {{ $active ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300' }}">
                        @switch($item['name'])
                            @case('Home') <x-lucide-home class="h-4 w-4" /> @break
                            @case('Questions') <x-lucide-file-text class="h-4 w-4" /> @break
                            @case('Contributors') <x-lucide-users class="h-4 w-4" /> @break
                            @case('About') <x-lucide-info class="h-4 w-4" /> @break
                            @case('Contact') <x-lucide-mail class="h-4 w-4" /> @break
                        @endswitch
                        {{ $item['name'] }}
                        @if ($active)
                            <span class="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-300"></span>
                        @endif
                    </a>
                @endforeach
            </nav>

            <div class="flex items-center gap-2">
                @php $me = auth()->user(); @endphp
                @if ($me)
                    <div class="hidden md:block relative">
                        <button id="user-menu-button" type="button" aria-haspopup="menu" aria-expanded="false" class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 shadow-sm">
                            <span class="h-7 w-7 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-[10px] font-semibold">
                                @if (!empty($me->image))
                                    <img src="{{ $me->image }}" alt="{{ $me->name }}" class="h-full w-full object-cover" />
                                @else
                                    {{ collect(explode(' ', trim($me->name ?? 'U')))->filter()->map(fn($w) => mb_substr($w,0,1))->join('') }}
                                @endif
                            </span>
                        </button>
                        <div id="user-menu" role="menu" aria-labelledby="user-menu-button" class="hidden absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden z-50">
                            <div class="px-3 py-3">
                                <div class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ $me->name }}</div>
                                <div class="text-xs text-slate-600 dark:text-slate-400 truncate">{{ $me->email }}</div>
                            </div>
                            <div class="border-t border-slate-200 dark:border-slate-700"></div>
                            <div class="p-2">
                                <a href="{{ url('/contributors/'.$me->username) }}" class="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <x-lucide-user class="h-4 w-4" /> Profile
                                </a>
                                @if (\Illuminate\Support\Facades\Route::has('logout'))
                                    <form method="POST" action="{{ route('logout') }}" class="mt-1">
                                        @csrf
                                        <button type="submit" class="w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                                            <x-lucide-log-out class="h-4 w-4" /> Logout
                                        </button>
                                    </form>
                                @else
                                    <a href="#" class="mt-1 flex items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 opacity-60 cursor-not-allowed">
                                        <x-lucide-log-out class="h-4 w-4" /> Logout
                                    </a>
                                @endif
                            </div>
                        </div>
                    </div>
                @else
                    <a href="{{ route('login') }}" class="hidden md:inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 shadow-sm">
                        <x-lucide-log-in class="h-4 w-4" /> Login
                    </a>
                @endif
                <button id="theme-toggle" type="button" aria-label="Toggle theme" class="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white/70 hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800 shadow-sm">
                    <x-lucide-sun class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <x-lucide-moon class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </button>
                <button id="menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav" class="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/70 hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800 shadow-sm">
                    <x-lucide-menu class="h-5 w-5" />
                </button>
            </div>
        </div>
    </div>
</header>

<div id="mobile-overlay" class="fixed inset-0 z-50 md:hidden transition-opacity duration-300 pointer-events-none opacity-0">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
    <div id="mobile-nav" role="dialog" aria-modal="true" class="absolute right-0 top-0 h-full w-[78%] max-w-sm bg-white/95 dark:bg-slate-950/95 shadow-xl ring-1 ring-slate-200/70 dark:ring-slate-800/60 backdrop-blur-md transition-transform duration-300 ease-out flex flex-col translate-x-full">
        <div class="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-200/70 dark:border-slate-800/60">
            <span class="font-semibold text-slate-700 dark:text-slate-200 text-sm">Menu</span>
            <button id="menu-close" type="button" aria-label="Close menu" class="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <x-lucide-x class="h-5 w-5" />
            </button>
        </div>
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            @if ($me)
                <a href="{{ url('/contributors/'.$me->username) }}" class="group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium outline-none ring-offset-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:ring-offset-slate-950 transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 mb-2">
                    <span class="h-7 w-7 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-[10px] font-semibold">
                        @if (!empty($me->image))
                            <img src="{{ $me->image }}" alt="{{ $me->name }}" class="h-full w-full object-cover" />
                        @else
                            {{ collect(explode(' ', trim($me->name ?? 'U')))->filter()->map(fn($w) => mb_substr($w,0,1))->join('') }}
                        @endif
                    </span>
                    <span class="truncate">{{ $me->name }}</span>
                    <x-lucide-chevron-right class="h-4 w-4 ml-auto opacity-60" />
                </a>
            @else
                <a href="{{ route('login') }}" class="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 mb-2">
                    <x-lucide-log-in class="h-4 w-4" /> Login
                </a>
            @endif
            @foreach ($navItems as $idx => $item)
                @php $active = $isActive($item['pattern']); @endphp
                <a href="{{ $item['href'] }}" @if($idx === 0) id="first-mobile-link" @endif aria-current="{{ $active ? 'page' : '' }}" class="group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium outline-none ring-offset-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:ring-offset-slate-950 transition-colors {{ $active ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' }}">
                    @switch($item['name'])
                        @case('Home') <x-lucide-home class="h-5 w-5 {{ $active ? 'text-blue-600 dark:text-blue-300' : '' }}" /> @break
                        @case('Questions') <x-lucide-file-text class="h-5 w-5 {{ $active ? 'text-blue-600 dark:text-blue-300' : '' }}" /> @break
                        @case('Contributors') <x-lucide-users class="h-5 w-5 {{ $active ? 'text-blue-600 dark:text-blue-300' : '' }}" /> @break
                        @case('About') <x-lucide-info class="h-5 w-5 {{ $active ? 'text-blue-600 dark:text-blue-300' : '' }}" /> @break
                        @case('Contact') <x-lucide-mail class="h-5 w-5 {{ $active ? 'text-blue-600 dark:text-blue-300' : '' }}" /> @break
                    @endswitch
                    {{ $item['name'] }}
                    @if ($active)
                        <span class="absolute inset-y-1 right-1 w-1 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500"></span>
                    @endif
                </a>
            @endforeach
        </nav>
        <div class="px-4 py-4 border-t border-slate-200/70 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>© {{ now()->year }} DIUQbank</span>
            <span class="px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-medium">v1.0</span>
        </div>
    </div>
</div>

<div class="h-16" aria-hidden></div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    const html = document.documentElement;

    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            const isDark = html.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    const header = document.getElementById('app-navbar');
    function applyScroll() {
        const scrolled = window.scrollY > 4;
        if (!header) return;
        const add = ['bg-white/85','dark:bg-slate-950/70','border-slate-200/70','dark:border-slate-800/60','shadow-[0_2px_4px_-2px_rgba(0,0,0,0.08)]'];
        const remove = ['bg-white/60','dark:bg-slate-950/40','border-transparent'];
        if (scrolled) {
            header.classList.add(...add);
            header.classList.remove(...remove);
        } else {
            header.classList.remove(...add);
            header.classList.add(...remove);
        }
    }
    applyScroll();
    window.addEventListener('scroll', applyScroll, { passive: true });

    const menuButton = document.getElementById('menu-button');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileNav = document.getElementById('mobile-nav');
    const menuClose = document.getElementById('menu-close');
    const firstMobileLink = document.getElementById('first-mobile-link');
    const headerEl = document.getElementById('app-navbar');
    const mainEl = document.getElementById('main');
    function openMenu() {
        if (!mobileOverlay || !mobileNav || !menuButton) return;
        mobileOverlay.classList.remove('pointer-events-none','opacity-0');
        mobileOverlay.classList.add('pointer-events-auto','opacity-100');
        mobileNav.classList.remove('translate-x-full');
        mobileNav.classList.add('translate-x-0');
        menuButton.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        if (headerEl) headerEl.setAttribute('inert', '');
        if (mainEl) mainEl.setAttribute('inert', '');
        if (firstMobileLink) firstMobileLink.focus();
    }
    function closeMenu() {
        if (!mobileOverlay || !mobileNav || !menuButton) return;
        mobileOverlay.classList.add('pointer-events-none','opacity-0');
        mobileOverlay.classList.remove('pointer-events-auto','opacity-100');
        mobileNav.classList.add('translate-x-full');
        mobileNav.classList.remove('translate-x-0');
        menuButton.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (headerEl) headerEl.removeAttribute('inert');
        if (mainEl) mainEl.removeAttribute('inert');
        menuButton.focus();
    }
    if (menuButton) menuButton.addEventListener('click', openMenu);
    if (menuClose) menuClose.addEventListener('click', closeMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', function (e) { if (e.target === mobileOverlay) closeMenu(); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

    // User menu toggle (desktop)
    const userBtn = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    function closeUserMenu() {
        if (userMenu) userMenu.classList.add('hidden');
        if (userBtn) userBtn.setAttribute('aria-expanded', 'false');
    }
    function toggleUserMenu() {
        if (!userBtn || !userMenu) return;
        const hidden = userMenu.classList.contains('hidden');
        document.querySelectorAll('#user-menu').forEach(el => { if (el !== userMenu) el.classList.add('hidden'); });
        if (hidden) {
            userMenu.classList.remove('hidden');
            userBtn.setAttribute('aria-expanded', 'true');
        } else {
            closeUserMenu();
        }
    }
    if (userBtn) userBtn.addEventListener('click', function (e) { e.stopPropagation(); toggleUserMenu(); });
    document.addEventListener('click', function () { closeUserMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeUserMenu(); });
});
</script>


