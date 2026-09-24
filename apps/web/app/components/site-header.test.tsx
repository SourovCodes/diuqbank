import { cleanup, render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { afterEach, expect, it } from "vitest";
import type { SessionUser } from "~/lib/types";
import { SiteHeader } from "./site-header";

afterEach(cleanup);

function renderHeader(user: SessionUser | null) {
  const Stub = createRoutesStub([
    { path: "/", Component: () => <SiteHeader user={user} /> },
  ]);
  render(<Stub initialEntries={["/"]} />);
}

it("offers log in and sign up to visitors", async () => {
  renderHeader(null);
  expect(await screen.findByRole("link", { name: "Log in" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Sign up" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Account menu" })).toBeNull();
});

it("shows the account menu instead when signed in", async () => {
  renderHeader({
    id: "u1",
    name: "Ayesha Rahman",
    email: "ayesha@example.com",
  });
  const menu = await screen.findByRole("button", { name: "Account menu" });
  expect(menu.textContent).toBe("AR");
  expect(screen.queryByRole("link", { name: "Log in" })).toBeNull();
  expect(screen.getByRole("link", { name: /Contribute/ })).toBeTruthy();
});

it("links admins to the admin panel from the account menu", async () => {
  renderHeader({
    id: "u2",
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
  });
  const menu = await screen.findByRole("button", { name: "Account menu" });
  // Radix opens menus on pointerdown, not click.
  menu.dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
  );
  expect(
    await screen.findByRole("menuitem", { name: "Admin panel" }),
  ).toBeTruthy();
});
