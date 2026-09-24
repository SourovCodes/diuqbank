import "@fontsource-variable/inter";
import { FileQuestion, TriangleAlert } from "lucide-react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { EmptyState } from "~/components/empty-state";
import { SiteHeader } from "~/components/site-header";
import { buttonVariants } from "~/components/ui/button";
import { getUser } from "~/lib/session.server";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export async function loader({ request }: Route.LoaderArgs) {
  return { user: await getUser(request) };
}

// The session only changes through form actions (log in, sign up, log out), so
// plain navigations don't need to re-fetch it.
export function shouldRevalidate({
  formMethod,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  return formMethod ? defaultShouldRevalidate : false;
}

/** Set `handle = { fullBleed: true }` on a route to lay it out edge to edge, without the footer. */
export type RouteHandle = { fullBleed?: boolean };

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const fullBleed = useMatches().some(
    (match) => (match.handle as RouteHandle | undefined)?.fullBleed,
  );

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <div className="flex min-h-dvh flex-col">
          <SiteHeader user={data?.user ?? null} fluid={fullBleed} />
          <main
            className={
              fullBleed ? "flex flex-1 flex-col" : "container flex-1 py-8"
            }
          >
            {children}
          </main>
          <footer className={fullBleed ? "hidden" : "border-t"}>
            <div className="container flex flex-col gap-2 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>QuestionBank · Free past question papers</p>
              <nav className="flex gap-4">
                <Link to="/questions" className="hover:text-foreground">
                  Questions
                </Link>
                <Link to="/contributors" className="hover:text-foreground">
                  Contributors
                </Link>
                <Link to="/contribute" className="hover:text-foreground">
                  Contribute
                </Link>
              </nav>
            </div>
          </footer>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Something went wrong";
  let details = "An unexpected error occurred. Please try again.";
  let stack: string | undefined;
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  if (isRouteErrorResponse(error)) {
    title = notFound ? "Page not found" : `Error ${error.status}`;
    details = notFound
      ? "We couldn't find what you were looking for."
      : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="space-y-6 py-8">
      <EmptyState
        icon={notFound ? FileQuestion : TriangleAlert}
        title={title}
        description={details}
        action={
          <Link
            to="/"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to home
          </Link>
        }
      />
      {stack && (
        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-left text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </div>
  );
}
