import type { ApiError } from "@qb/shared";
import { Check, Upload } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { data, Form, useNavigation } from "react-router";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { FormField, FormMessage } from "~/components/form";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { apiFetch, readJson, setCookieHeaders } from "~/lib/api.server";
import { requireUser } from "~/lib/session.server";
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

function SettingsCard({
  intent,
  title,
  description,
  submitLabel,
  result,
  formRef,
  children,
}: {
  intent: Intent;
  title: string;
  description: string;
  submitLabel: string;
  result?: ActionResult;
  formRef?: React.Ref<HTMLFormElement>;
  children: React.ReactNode;
}) {
  const navigation = useNavigation();
  const submitting =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === intent;
  const headingId = useId();

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Form method="post" ref={formRef} aria-labelledby={headingId}>
        <input type="hidden" name="intent" value={intent} />
        <div className="space-y-1 p-4 sm:px-6 sm:pt-6">
          <h2 id={headingId} className="font-semibold">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="grid max-w-md gap-4 px-4 pb-6 sm:px-6">
          {children}
          <FormMessage message={result?.error} />
        </div>
        <div className="flex items-center justify-end gap-3 border-t bg-muted/30 px-4 py-3 sm:px-6">
          {result?.success && !submitting && (
            <p
              role="status"
              className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400"
            >
              <Check className="size-4" aria-hidden />
              {result.success}
            </p>
          )}
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "Saving…" : submitLabel}
          </Button>
        </div>
      </Form>
    </Card>
  );
}

function AvatarCard({
  name,
  image,
  result,
}: {
  name: string;
  image?: string | null;
  result?: ActionResult;
}) {
  const navigation = useNavigation();
  const intent = navigation.formData?.get("intent");
  const busy =
    navigation.state === "submitting" &&
    (intent === "avatar" || intent === "removeAvatar");
  const [preview, setPreview] = useState<string | null>(null);

  // Free the previous preview's object URL.
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="space-y-1 p-4 sm:px-6 sm:pt-6">
        <h2 className="font-semibold">Profile photo</h2>
        <p className="text-sm text-muted-foreground">
          Shown next to your name. JPEG, PNG or WebP, up to 2 MB.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4 px-4 pb-6 sm:px-6">
        <ContributorAvatar name={name} image={preview ?? image} size="xl" />
        <Form
          method="post"
          encType="multipart/form-data"
          className="flex flex-wrap items-center gap-2"
        >
          <input type="hidden" name="intent" value="avatar" />
          <label
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className:
                "cursor-pointer has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
            })}
          >
            <Upload aria-hidden />
            {image ? "Change photo" : "Choose photo"}
            <input
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp"
              required
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setPreview(file ? URL.createObjectURL(file) : null);
              }}
            />
          </label>
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
      {(result?.error || (result?.success && !busy)) && (
        <div className="border-t bg-muted/30 px-4 py-3 sm:px-6">
          {result.error ? (
            <p role="alert" className="text-sm text-destructive">
              {result.error}
            </p>
          ) : (
            <p
              role="status"
              className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400"
            >
              <Check className="size-4" aria-hidden />
              {result.success}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

export default function AccountProfile({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { user } = loaderData;
  const avatar = actionData?.intent === "avatar" ? actionData : undefined;
  const profile = actionData?.intent === "profile" ? actionData : undefined;
  const password = actionData?.intent === "password" ? actionData : undefined;
  const passwordForm = useRef<HTMLFormElement>(null);
  const revokeId = useId();

  // Don't leave passwords sitting in the fields after a successful change.
  useEffect(() => {
    if (password?.success) passwordForm.current?.reset();
  }, [password]);

  return (
    <div className="space-y-6">
      {/* Re-mounted when the image changes, which clears the local preview. */}
      <AvatarCard
        key={user.image ?? "none"}
        name={user.name}
        image={user.image}
        result={avatar}
      />
      <SettingsCard
        intent="profile"
        title="Profile"
        description="Your name is shown publicly on the papers you contribute."
        submitLabel="Save changes"
        result={profile}
      >
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
            Your email is private and can’t be changed yet.
          </p>
        </div>
      </SettingsCard>

      <SettingsCard
        intent="password"
        title="Password"
        description="Use at least 8 characters. You’ll stay signed in on this device."
        submitLabel="Change password"
        result={password}
        formRef={passwordForm}
      >
        <FormField
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          error={password?.fieldErrors?.currentPassword}
        />
        <FormField
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          maxLength={MAX_PASSWORD}
          error={password?.fieldErrors?.newPassword}
        />
        <FormField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          error={password?.fieldErrors?.confirmPassword}
        />
        <div className="flex items-center gap-2">
          <input
            id={revokeId}
            type="checkbox"
            name="revokeOtherSessions"
            defaultChecked
            className="size-4 accent-primary"
          />
          <label htmlFor={revokeId} className="text-sm">
            Sign out of all other devices
          </label>
        </div>
      </SettingsCard>
    </div>
  );
}
