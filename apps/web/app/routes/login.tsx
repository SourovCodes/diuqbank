import {
  Form,
  Link,
  redirect,
  useNavigation,
  useSearchParams,
} from "react-router";
import { AuthCard } from "~/components/auth-card";
import { FormField, FormMessage } from "~/components/form";
import { Button } from "~/components/ui/button";
import { apiFetch, setCookieHeaders } from "~/lib/api.server";
import { safeRedirect } from "~/lib/redirect";
import { getUser } from "~/lib/session.server";
import type { Route } from "./+types/login";

export const meta: Route.MetaFunction = () => [
  { title: "Log in — QuestionBank" },
  { name: "robots", content: "noindex" },
];

export async function loader({ request }: Route.LoaderArgs) {
  if (await getUser(request)) throw redirect("/");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const res = await apiFetch(request, "/api/auth/sign-in/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: form.get("email"),
      password: form.get("password"),
    }),
  });

  if (!res.ok) {
    return {
      error:
        res.status === 401
          ? "Invalid email or password."
          : "Could not sign in. Please try again.",
    };
  }
  throw redirect(safeRedirect(form.get("redirectTo")), {
    headers: setCookieHeaders(res),
  });
}

export default function Login({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const submitting = useNavigation().state === "submitting";

  return (
    <AuthCard
      title="Log in"
      description="Sign in to contribute question papers."
      footer={
        <>
          No account?{" "}
          <Link
            to={`/signup?${searchParams}`}
            className="text-foreground underline underline-offset-4"
          >
            Sign up
          </Link>
        </>
      }
    >
      <Form method="post" className="grid gap-4">
        <input
          type="hidden"
          name="redirectTo"
          value={searchParams.get("redirectTo") ?? "/"}
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <FormMessage message={actionData?.error} />
        <Button type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Log in"}
        </Button>
      </Form>
    </AuthCard>
  );
}
