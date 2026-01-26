import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ChevronDown, LayoutDashboard, LogOut, Menu, Moon, Settings, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { SharedData } from '@/types';

const navigationItems = [
    { href: '/', label: 'Home' },
    { href: '/#features', label: 'Features' },
    { href: '/#how-it-works', label: 'How It Works' },
];

export function Navbar() {
    const { auth } = usePage<SharedData>().props;
    const { theme, setTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold">DIU QBank</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-1 md:flex">
                    {navigationItems.map((item) => (
                        <Button key={item.href} variant="ghost" size="sm" asChild>
                            <Link href={item.href}>{item.label}</Link>
                        </Button>
                    ))}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="hidden sm:inline-flex"
                    >
                        <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                        <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    {auth?.user ? (
                        <>
                            {/* Dashboard Button */}
                            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                                <Link href="/dashboard">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative flex items-center gap-2 px-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary text-sm text-primary-foreground">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="flex items-center justify-start gap-2 p-2">
                                        <div className="flex flex-col space-y-1 leading-none">
                                            <p className="font-medium">{auth.user.name}</p>
                                            <p className="text-sm text-muted-foreground">{auth.user.email}</p>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard" className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/profile" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/settings" className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/logout" method="post" as="button" className="w-full cursor-pointer">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/register">Get Started</Link>
                            </Button>
                        </>
                    )}

                    {/* Mobile Menu */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle>
                                    <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                                        <svg className="h-8 w-8 text-primary" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="32" height="32" rx="8" fill="currentColor" />
                                            <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span className="text-xl font-bold">3AG</span>
                                    </Link>
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="mt-8 flex flex-col gap-2">
                                {navigationItems.map((item) => (
                                    <Button
                                        key={item.href}
                                        variant="ghost"
                                        className="justify-start"
                                        asChild
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Link href={item.href}>{item.label}</Link>
                                    </Button>
                                ))}

                                {auth?.user ? (
                                    <>
                                        <div className="my-4 border-t" />
                                        <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                            <Link href="/dashboard">
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Dashboard
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                            <Link href="/dashboard/profile">
                                                <User className="mr-2 h-4 w-4" />
                                                Profile
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                            <Link href="/dashboard/settings">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Settings
                                            </Link>
                                        </Button>
                                        <div className="my-4 border-t" />
                                        <Button variant="ghost" className="justify-start text-destructive" asChild>
                                            <Link href="/logout" method="post" as="button">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Logout
                                            </Link>
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="my-4 border-t" />
                                        <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                            <Link href="/login">Login</Link>
                                        </Button>
                                        <Button asChild onClick={() => setMobileMenuOpen(false)}>
                                            <Link href="/register">Get Started</Link>
                                        </Button>
                                    </>
                                )}

                                <div className="my-4 border-t" />
                                <div className="flex items-center justify-between px-4">
                                    <span className="text-sm text-muted-foreground">Theme</span>
                                    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                        <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                                        <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                                    </Button>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
