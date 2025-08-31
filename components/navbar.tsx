"use client";

import { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef, memo, useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Moon,
    Sun,
    Menu,
    X,
    Home,
    FileQuestion,
    Users,
    Info,
    Mail,
    LogOut,
    User,
    Settings,
} from "lucide-react";

// Memoized menu items for better performance
const menuItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Questions", href: "/questions", icon: FileQuestion },
    { name: "Contributors", href: "/contributors", icon: Users },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
];

// Freeze to avoid accidental runtime mutations
Object.freeze(menuItems);

const UserDropdown = memo(function UserDropdown() {
    const { data: session } = useSession();

    const handleSignOut = useCallback(async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Sign out error:", error);
        }
    }, []);

    if (!session) {
        return (
            <Button asChild variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/login">Sign In</Link>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu" aria-haspopup="menu" type="button">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name ?? "User avatar"} />
                        <AvatarFallback className="bg-blue-600 text-white">
                            {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                        {session.user.name && (
                            <p className="font-medium">{session.user.name}</p>
                        )}
                        {session.user.email && (
                            <p className="w-[200px] truncate text-sm text-muted-foreground">
                                {session.user.email}
                            </p>
                        )}
                    </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    const menuButtonRef = useRef<HTMLButtonElement | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);
    const drawerId = useId();
    const previousOverflowRef = useRef<string>("");

    // Handle client-side mounting
    useLayoutEffect(() => {
        setMounted(true);
    }, []);

    // Respect user's reduced motion preference
    useEffect(() => {
        if (typeof window === "undefined" || !("matchMedia" in window)) return;
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handler = () => setPrefersReducedMotion(media.matches);
        handler();
        media.addEventListener("change", handler);
        return () => media.removeEventListener("change", handler);
    }, []);

    // Handle scroll effect for navbar background
    useEffect(() => {
        if (!mounted) return;

        let rafId = 0;
        const update = () => {
            const isScrolled = window.scrollY > 10;
            setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
        };
        const handleScroll = () => {
            if (rafId) return;
            rafId = window.requestAnimationFrame(() => {
                update();
                rafId = 0;
            });
        };

        // Initialize on mount
        update();

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener("scroll", handleScroll);
        };
    }, [mounted]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            previousOverflowRef.current = document.body.style.overflow || "";
            document.body.style.overflow = "hidden";
            // Move focus into the drawer for accessibility
            closeButtonRef.current?.focus();
        } else {
            document.body.style.overflow = previousOverflowRef.current || "unset";
            // Return focus to the menu button when closing
            menuButtonRef.current?.focus();
        }
        return () => {
            document.body.style.overflow = previousOverflowRef.current || "unset";
        };
    }, [isMenuOpen]);

    // Handle theme toggle with smooth transition
    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark");
    }, [theme, setTheme]);

    const isPathActive = useCallback(
        (href: string) => pathname === href || (href !== "/" && pathname?.startsWith(href)),
        [pathname]
    );

    const currentYear = useMemo(() => new Date().getFullYear(), []);

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
                    mounted && scrolled && "shadow-sm",
                    mounted && !prefersReducedMotion && "transition-colors duration-200"
                )}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and brand */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-sm">D</span>
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-300">
                                    DIUQbank
                                </span>
                            </Link>
                        </div>

                        {/* Desktop navigation */}
                        <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Primary">
                            <div className="flex items-center space-x-1 mr-4">
                                {menuItems.map((item) => {
                                    const active = isPathActive(item.href);

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                "px-3 py-2 text-sm rounded-md flex items-center gap-1.5 transition-all duration-200",
                                                active
                                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 font-medium shadow-sm"
                                                    : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            )}
                                            aria-current={active ? "page" : undefined}
                                        >
                                            <item.icon className="h-4 w-4" aria-hidden="true" />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleTheme}
                                    className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                                    aria-label="Toggle theme"
                                    aria-pressed={mounted ? theme === "dark" : undefined}
                                    type="button"
                                >
                                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
                                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
                                </Button>
                                <UserDropdown />
                            </div>
                        </nav>

                        {/* Mobile navigation controls */}
                        <div className="flex md:hidden items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                                aria-label="Toggle theme"
                                aria-pressed={mounted ? theme === "dark" : undefined}
                                type="button"
                            >
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                ref={menuButtonRef}
                                onClick={() => setIsMenuOpen((v) => !v)}
                                className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 ml-1"
                                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                                aria-expanded={isMenuOpen}
                                aria-controls={drawerId}
                                type="button"
                            >
                                <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" aria-hidden="true" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile menu overlay with improved animations */}
            <div
                className={cn(
                    "fixed inset-0 z-50 bg-black/70 md:hidden transition-all duration-300",
                    isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsMenuOpen(false)}
                aria-hidden={!isMenuOpen}
                onKeyDown={(e) => {
                    if (e.key === "Escape") setIsMenuOpen(false);
                }}
            >
                <div
                    className={cn(
                        "absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white dark:bg-slate-900 shadow-xl",
                        mounted && !prefersReducedMotion && "transition-transform duration-300 ease-in-out transform",
                        isMenuOpen ? "translate-x-0" : "translate-x-full"
                    )}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    id={drawerId}
                >
                    <div className="flex flex-col h-full">
                        {/* Menu header with profile or sign in */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <UserDropdown />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                                    aria-label="Close menu"
                                    ref={closeButtonRef}
                                    type="button"
                                >
                                    <X className="h-5 w-5 text-slate-700 dark:text-slate-300" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>

                        {/* Navigation menu with improved active state */}
                        <nav className="py-4 px-2 space-y-1 flex-1 overflow-y-auto" role="navigation" aria-label="Mobile">
                            {menuItems.map((item) => {
                                const active = isPathActive(item.href);

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "px-4 py-3 text-base rounded-md flex items-center transition-all duration-200",
                                            active
                                                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 font-medium"
                                                : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                        aria-current={active ? "page" : undefined}
                                    >
                                        <item.icon className="h-5 w-5 mr-3" aria-hidden="true" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Menu footer */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    © {currentYear} DIUQbank
                                </span>
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    v1.0
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-16"></div>
        </>
    );
}
