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
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("logout", "routes/logout.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
