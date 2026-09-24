import { Mail } from "lucide-react";
import { Link } from "react-router";
import { AuthCard } from "~/components/auth-card";
import { Button } from "~/components/ui/button";

/** Password resets are handled by hand: we check the request and send a new one. */
const RESET_EMAIL = "sourov2305101004@diu.edu.bd";

const RESET_MAIL = `mailto:${RESET_EMAIL}?subject=${encodeURIComponent("QuestionBank password reset")}&body=${encodeURIComponent("Hi, please reset the password for my QuestionBank account.\n\nAccount email: \n")}`;

export function meta() {
  return [
    { title: "Forgot password — QuestionBank" },
    {
      name: "description",
      content: "How to get a new password for your QuestionBank account.",
    },
  ];
}

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      description="We reset passwords by hand for now."
      footer={
        <>
          Remembered it?{" "}
          <Link
            to="/login"
            className="text-foreground underline underline-offset-4"
          >
            Log in
          </Link>
        </>
      }
    >
      <div className="grid gap-4 text-sm">
        <ol className="grid list-decimal gap-2 pl-5 text-muted-foreground">
          <li>
            Email{" "}
            <a
              href={RESET_MAIL}
              className="font-medium break-all text-foreground underline underline-offset-4"
            >
              {RESET_EMAIL}
            </a>{" "}
            from the address you signed up with.
          </li>
          <li>We check that the account is yours.</li>
          <li>You get a new password by email. Change it after you log in.</li>
        </ol>
        <p className="rounded-md bg-muted px-3 py-2 text-muted-foreground">
          Used the old diuqbank.com with Google? Your account and papers moved
          here. Ask for a password the same way.
        </p>
        <Button asChild>
          <a href={RESET_MAIL}>
            <Mail aria-hidden />
            Email for a new password
          </a>
        </Button>
      </div>
    </AuthCard>
  );
}
