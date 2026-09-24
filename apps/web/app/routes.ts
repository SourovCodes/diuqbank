import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("questions", "routes/questions.tsx"),
  route("questions/:id", "routes/question.tsx"),
  route("contributors", "routes/contributors.tsx"),
  route("contributors/:id", "routes/contributor.tsx"),
  route("contribute", "routes/contribute.tsx"),
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
  route("signup", "routes/signup.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("logout", "routes/logout.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
