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
import { apiFetch, readJson, setCookieHeaders } from "~/lib/api.server";
import { safeRedirect } from "~/lib/redirect";
import { getUser } from "~/lib/session.server";
import type { Route } from "./+types/signup";

export const meta: Route.MetaFunction = () => [
  { title: "Sign up — QuestionBank" },
  { name: "robots", content: "noindex" },
];

export async function loader({ request }: Route.LoaderArgs) {
  if (await getUser(request)) throw redirect("/");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const res = await apiFetch(request, "/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    }),
  });

  if (!res.ok) {
    const body = await readJson<{ message?: string }>(res).catch(() => null);
    return {
      error:
        body?.message ?? "Could not create your account. Please try again.",
    };
  }
  // Better Auth signs the user in on sign-up, so forward its session cookie.
  throw redirect(safeRedirect(form.get("redirectTo")), {
    headers: setCookieHeaders(res),
  });
}

export default function Signup({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const submitting = useNavigation().state === "submitting";

  return (
    <AuthCard
      title="Create an account"
      description="Only needed if you want to contribute papers."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={`/login?${searchParams}`}
            className="text-foreground underline underline-offset-4"
          >
            Log in
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
          label="Name"
          name="name"
          autoComplete="name"
          required
          maxLength={100}
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
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
        />
        <FormMessage message={actionData?.error} />
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </Form>
    </AuthCard>
  );
}
