import type { ApiError } from "@qb/shared";
import { Check } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { data, Form, useNavigation } from "react-router";
import { AvatarInput } from "~/components/avatar-input";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { FormField, FormMessage } from "~/components/form";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { apiFetch, readJson, setCookieHeaders } from "~/lib/api.server";
import { requireUser } from "~/lib/session.server";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/account-profile";

export const meta: Route.MetaFunction = () => [
  { title: "Profile — QuestionBank" },
  { name: "robots", content: "noindex" },
];

export async function loader({ request }: Route.LoaderArgs) {
  return { user: await requireUser(request) };
}

type Intent = "profile" | "password" | "avatar";

type ActionResult = {
  intent: Intent;
  success?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;
const MAX_NAME = 100;

const invalid = (intent: Intent, fieldErrors: Record<string, string>) =>
  data<ActionResult>({ intent, fieldErrors }, { status: 422 });

async function updateProfile(request: Request, form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  if (!name || name.length > MAX_NAME) {
    return invalid("profile", {
      name: `Enter a name of up to ${MAX_NAME} characters.`,
    });
  }

  const res = await apiFetch(request, "/api/auth/update-user", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    return data<ActionResult>(
      {
        intent: "profile",
        error: "Could not update your profile. Please try again.",
      },
      { status: res.status },
    );
  }
  return data<ActionResult>(
    { intent: "profile", success: "Profile updated" },
    { headers: setCookieHeaders(res) },
  );
}

async function changePassword(request: Request, form: FormData) {
  const currentPassword = String(form.get("currentPassword") ?? "");
  const newPassword = String(form.get("newPassword") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!currentPassword) {
    fieldErrors.currentPassword = "Enter your current password.";
  }
  if (newPassword.length < MIN_PASSWORD || newPassword.length > MAX_PASSWORD) {
    fieldErrors.newPassword = `Use ${MIN_PASSWORD} to ${MAX_PASSWORD} characters.`;
  } else if (newPassword !== confirmPassword) {
    fieldErrors.confirmPassword = "The passwords don't match.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return invalid("password", fieldErrors);
  }

  const res = await apiFetch(request, "/api/auth/change-password", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      revokeOtherSessions: form.get("revokeOtherSessions") === "on",
    }),
  });

  if (!res.ok) {
    const body = await readJson<{ code?: string; message?: string }>(res).catch(
      () => null,
    );
    if (body?.code === "INVALID_PASSWORD") {
      return invalid("password", {
        currentPassword: "Your current password is incorrect.",
      });
    }
    return data<ActionResult>(
      {
        intent: "password",
        // Better Auth requires a recent sign-in for password changes.
        error:
          res.status === 403
            ? "For your security, log out and log back in, then try again."
            : (body?.message ?? "Could not change your password."),
      },
      { status: res.status },
    );
  }
  // Revoking other sessions issues a new session cookie for this one.
  return data<ActionResult>(
    { intent: "password", success: "Password changed" },
    { headers: setCookieHeaders(res) },
  );
}

async function avatarResult(res: Response, success: string) {
  if (res.ok) return data<ActionResult>({ intent: "avatar", success });
  const body = await readJson<ApiError>(res).catch(() => null);
  return data<ActionResult>(
    {
      intent: "avatar",
      error:
        body && body.error.code !== "VALIDATION_ERROR"
          ? body.error.message
          : "Choose an image to upload.",
    },
    { status: res.status },
  );
}

async function uploadAvatar(request: Request, form: FormData) {
  const file = form.get("file");
  const body = new FormData();
  if (file instanceof File && file.size > 0) body.append("file", file);
  const res = await apiFetch(request, "/api/v1/me/avatar", {
    method: "PUT",
    body,
  });
  return avatarResult(res, "Photo updated");
}

async function removeAvatar(request: Request) {
  const res = await apiFetch(request, "/api/v1/me/avatar", {
    method: "DELETE",
  });
  return avatarResult(res, "Photo removed");
}

export async function action({ request }: Route.ActionArgs) {
  await requireUser(request);
  const form = await request.formData();
  switch (form.get("intent")) {
    case "avatar":
      return uploadAvatar(request, form);
    case "removeAvatar":
      return removeAvatar(request);
    case "profile":
      return updateProfile(request, form);
    case "password":
      return changePassword(request, form);
    default:
      throw data("Unknown action", { status: 400 });
  }
}

/** A settings row: what it is on the left (from `md`), the controls in a card. */
function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="grid gap-4 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8"
    >
      <div className="space-y-1">
        <h2 id={headingId} className="font-medium">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card className="gap-0 py-0">{children}</Card>
    </section>
  );
}

function Saved({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="flex items-center gap-1.5 text-sm text-muted-foreground"
    >
      <Check className="size-4" aria-hidden />
      {message}
    </p>
  );
}

function useSubmitting(...intents: string[]) {
  const navigation = useNavigation();
  const intent = navigation.formData?.get("intent");
  return (
    navigation.state === "submitting" &&
    typeof intent === "string" &&
    intents.includes(intent)
  );
}

function AvatarField({
  name,
  image,
  result,
}: {
  name: string;
  image?: string | null;
  result?: ActionResult;
}) {
  const busy = useSubmitting("avatar", "removeAvatar");
  const [preview, setPreview] = useState<string | null>(null);

  // Free the previous preview's object URL.
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  return (
    <div className="flex items-center gap-4">
      <ContributorAvatar name={name} image={preview ?? image} size="xl" />
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Form
            method="post"
            encType="multipart/form-data"
            className="flex flex-wrap items-center gap-2"
          >
            <input type="hidden" name="intent" value="avatar" />
            <AvatarInput
              name="file"
              label={image ? "Change photo" : "Choose photo"}
              onChange={(file) =>
                setPreview(file ? URL.createObjectURL(file) : null)
              }
            />
            {preview && (
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? "Saving…" : "Save photo"}
              </Button>
            )}
          </Form>
          {image && !preview && (
            <Form method="post">
              <input type="hidden" name="intent" value="removeAvatar" />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                disabled={busy}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Remove
              </Button>
            </Form>
          )}
        </div>
        {result?.error ? (
          <p role="alert" className="text-sm text-destructive">
            {result.error}
          </p>
        ) : result?.success && !busy ? (
          <Saved message={result.success} />
        ) : (
          <p className="text-xs text-muted-foreground">
            JPEG, PNG or WebP. You’ll crop it to a square.
          </p>
        )}
      </div>
    </div>
  );
}

function ProfileSection({
  user,
  avatar,
  profile,
}: {
  user: { name: string; email: string; image?: string | null };
  avatar?: ActionResult;
  profile?: ActionResult;
}) {
  const submitting = useSubmitting("profile");

  return (
    <SettingsSection
      title="Profile"
      description="Your photo and name are shown on the papers you contribute."
    >
      {/* The photo has forms of its own, so it sits outside the profile form. */}
      <div className="border-b p-6">
        {/* Re-mounted when the image changes, which clears the local preview. */}
        <AvatarField
          key={user.image ?? "none"}
          name={user.name}
          image={user.image}
          result={avatar}
        />
      </div>
      <Form method="post" aria-label="Profile details">
        <input type="hidden" name="intent" value="profile" />
        <div className="grid gap-4 p-6">
          <FormField
            label="Name"
            name="name"
            defaultValue={user.name}
            autoComplete="name"
            required
            maxLength={MAX_NAME}
            error={profile?.fieldErrors?.name}
          />
          <div className="grid gap-1.5">
            <FormField
              label="Email"
              name="email"
              type="email"
              value={user.email}
              readOnly
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Private, and can’t be changed yet.
            </p>
          </div>
          <FormMessage message={profile?.error} />
        </div>
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          {profile?.success && !submitting && (
            <Saved message={profile.success} />
          )}
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Form>
    </SettingsSection>
  );
}

function PasswordSection({ result }: { result?: ActionResult }) {
  const submitting = useSubmitting("password");
  const details = useRef<HTMLDetailsElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const revokeId = useId();
  const failed = Boolean(result?.error || result?.fieldErrors);

  // Don't leave passwords sitting in the fields after a successful change.
  useEffect(() => {
    if (!result?.success) return;
    form.current?.reset();
    if (details.current) details.current.open = false;
  }, [result]);

  return (
    <SettingsSection
      title="Password"
      description="Use at least 8 characters. You’ll stay signed in on this device."
    >
      {/* A native disclosure, so the form opens without JavaScript too. Reopened
          by the server when the change failed. */}
      <details ref={details} open={failed || undefined} className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 [&::-webkit-details-marker]:hidden">
          {result?.success && !submitting ? (
            <Saved message={result.success} />
          ) : (
            <span className="text-sm text-muted-foreground">
              Change the password you log in with.
            </span>
          )}
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "group-open:hidden",
            )}
          >
            Change password
          </span>
        </summary>
        <Form method="post" ref={form} aria-label="Change password">
          <input type="hidden" name="intent" value="password" />
          <div className="grid gap-4 px-6 pb-6">
            <FormField
              label="Current password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              error={result?.fieldErrors?.currentPassword}
            />
            <FormField
              label="New password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD}
              maxLength={MAX_PASSWORD}
              error={result?.fieldErrors?.newPassword}
            />
            <FormField
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              error={result?.fieldErrors?.confirmPassword}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id={revokeId}
                name="revokeOtherSessions"
                defaultChecked
              />
              <Label htmlFor={revokeId} className="font-normal">
                Sign out of all other devices
              </Label>
            </div>
            <FormMessage message={result?.error} />
          </div>
          <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                form.current?.reset();
                if (details.current) details.current.open = false;
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Saving…" : "Update password"}
            </Button>
          </div>
        </Form>
      </details>
    </SettingsSection>
  );
}

export default function AccountProfile({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { user } = loaderData;
  const pick = (intent: Intent) =>
    actionData?.intent === intent ? actionData : undefined;

  return (
    <div className="space-y-8">
      <ProfileSection
        user={user}
        avatar={pick("avatar")}
        profile={pick("profile")}
      />
      <Separator />
      <PasswordSection result={pick("password")} />
    </div>
  );
}
