import { describe, expect, it } from "vitest";
import { api, signUp } from "./helpers";

describe("email/password auth", () => {
  it("signs up and returns a usable session cookie", async () => {
    const { email, cookie } = await signUp();

    const res = await api("/api/auth/get-session", { headers: { cookie } });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ user: { email } });
  });

  it("signs in with correct credentials and rejects wrong ones", async () => {
    const { email } = await signUp();
    const signIn = (password: string) =>
      api("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

    expect((await signIn("correct-horse-battery")).status).toBe(200);
    expect((await signIn("wrong-password")).status).toBe(401);
  });
});
