import {
  BookOpen,
  FileText,
  LogOut,
  Menu,
  Settings,
  Upload,
} from "lucide-react";
import { Link, NavLink, useSubmit } from "react-router";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import type { SessionUser } from "~/lib/types";
import { cn } from "~/lib/utils";

const NAV_ITEMS = [
  { to: "/questions", label: "Questions" },
  { to: "/contributors", label: "Contributors" },
];

function Brand() {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <BookOpen className="size-4" aria-hidden />
      </span>
      QuestionBank
    </Link>
  );
}

function UserMenu({ user }: { user: SessionUser }) {
  const submit = useSubmit();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Account menu"
        >
          <ContributorAvatar name={user.name} image={user.image} size="sm" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/account/submissions">
            <FileText aria-hidden />
            My submissions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account">
            <Settings aria-hidden />
            Profile settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => submit(null, { method: "post", action: "/logout" })}
        >
          <LogOut aria-hidden />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Below `md` the page links live in a slide-over menu. */
function MobileMenu({ user }: { user: SessionUser | null }) {
  const links = [...NAV_ITEMS, { to: "/contribute", label: "Contribute" }];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Site navigation
          </SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="grid gap-1 px-4">
          {links.map(({ to, label }) => (
            <SheetClose key={to} asChild>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground",
                  )
                }
              >
                {label}
              </NavLink>
            </SheetClose>
          ))}
        </nav>
        {!user && (
          <div className="mt-auto grid gap-2 border-t p-4">
            <SheetClose asChild>
              <Link
                to="/login"
                className={buttonVariants({ variant: "outline" })}
              >
                Log in
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link to="/signup" className={buttonVariants()}>
                Sign up
              </Link>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function SiteHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center gap-6">
        <Brand />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-foreground",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground",
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/contribute"
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            <Upload aria-hidden />
            Contribute
          </Link>
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link
                to="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "hidden sm:inline-flex",
                )}
              >
                Sign up
              </Link>
            </>
          )}
          <MobileMenu user={user} />
        </div>
      </div>
    </header>
  );
}
