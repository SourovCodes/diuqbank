import { BookOpen, Upload } from "lucide-react";
import { Form, Link } from "react-router";
import { Button, buttonVariants } from "~/components/ui/button";
import type { SessionUser } from "~/lib/types";

export function SiteHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4 sm:gap-4">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
        >
          <BookOpen className="size-5 text-primary" aria-hidden />
          QuestionBank
        </Link>
        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* Icon-only on phones so the header never overflows. */}
          <Link
            to="/contribute"
            aria-label="Contribute"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <Upload aria-hidden />
            <span className="hidden sm:inline">Contribute</span>
          </Link>
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
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
