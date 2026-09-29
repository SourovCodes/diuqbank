import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("questions", "routes/questions.tsx"),
  route("questions/:id", "routes/question.tsx"),
  route("contributors", "routes/contributors.tsx"),
  route("contributors/:username", "routes/contributor.tsx"),
  route("contribute", "routes/contribute.tsx"),
  route("about", "routes/about.tsx"),
  route("contact", "routes/contact.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("terms", "routes/terms.tsx"),
  route("copyright", "routes/copyright.tsx"),
  route("cookies", "routes/cookies.tsx"),
  // A full page of its own, outside the account shell.
  route("account/submissions/:id", "routes/account-submission.tsx"),
  route("account", "routes/account.tsx", [
    index("routes/account-profile.tsx"),
    route("submissions", "routes/account-submissions.tsx"),
  ]),
  route("admin", "routes/admin.tsx", [
    index("routes/admin-dashboard.tsx"),
    route("submissions", "routes/admin-submissions.tsx"),
    route("submissions/:id", "routes/admin-submission.tsx"),
    route("reports", "routes/admin-reports.tsx"),
    route("catalog", "routes/admin-catalog.tsx"),
    route("users", "routes/admin-users.tsx"),
  ]),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("sitemap.xml", "routes/sitemap.ts"),
  route("robots.txt", "routes/robots.ts"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
