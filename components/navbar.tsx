"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PublicUserDropdown } from "./public-user-dropdown";
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
} from "lucide-react";

// Memoized menu items for better performance
const menuItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Questions", href: "/questions", icon: FileQuestion },
  { name: "Contributors", href: "/contributors", icon: Users },
  { name: "About", href: "/about", icon: Info },
  { name: "Contact", href: "/contact", icon: Mail },
];

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    // Use passive event listener for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Handle theme toggle with smooth transition
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300",
          scrolled
            ? "bg-white/90 dark:bg-slate-900/90 shadow-sm "
            : "bg-white/80 dark:bg-slate-900/80",
          "border-slate-200 dark:border-slate-800 backdrop-blur"
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
            <nav className="hidden md:flex items-center space-x-1">
              <div className="flex items-center space-x-1 mr-4">
                {menuItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname?.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "px-3 py-2 text-sm rounded-md flex items-center gap-1.5 transition-all duration-200",
                        isActive
                          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 font-medium shadow-sm"
                          : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <item.icon className="h-4 w-4" />
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
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
                <PublicUserDropdown />
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
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 ml-1"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
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
      >
        <div
          className={cn(
            "absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white/95 dark:bg-slate-900/95 shadow-xl transition-transform duration-300 ease-in-out transform",
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Menu header with profile or sign in */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <PublicUserDropdown align="start" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                </Button>
              </div>
            </div>

            {/* Navigation menu with improved active state */}
            <nav className="py-4 px-2 space-y-1 flex-1 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-4 py-3 text-base rounded-md flex items-center transition-all duration-200",
                      isActive
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 font-medium"
                        : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Menu footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  © {new Date().getFullYear()} DIUQbank
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
