import { BookOpen, Upload } from "lucide-react";
import { Form, Link, NavLink } from "react-router";
import { Button, buttonVariants } from "~/components/ui/button";
import type { SessionUser } from "~/lib/types";
import { cn } from "~/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    buttonVariants({ variant: "ghost", size: "sm" }),
    isActive ? "bg-accent text-foreground" : "text-muted-foreground",
  );

export function SiteHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="container-page flex h-14 items-center gap-2 sm:gap-4">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
        >
          <BookOpen className="size-5 text-primary" aria-hidden />
          {/* Icon-only on phones to leave room for the nav. */}
          <span className="sr-only sm:not-sr-only">QuestionBank</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <NavLink to="/questions" className={navLinkClass}>
            Questions
          </NavLink>
          {/* Icon-only on phones so the header never overflows. */}
          <NavLink
            to="/contribute"
            aria-label="Contribute"
            className={navLinkClass}
          >
            <Upload aria-hidden />
            <span className="hidden sm:inline">Contribute</span>
          </NavLink>
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">
                {user.name}
              </span>
              <Form method="post" action="/logout">
                <Button type="submit" variant="outline" size="sm">
                  Log out
                </Button>
              </Form>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Log in
              </Link>
              <Link to="/signup" className={buttonVariants({ size: "sm" })}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
