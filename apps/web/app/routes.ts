import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("questions", "routes/questions.tsx"),
  route("questions/:id", "routes/question.tsx"),
  route("contribute", "routes/contribute.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("logout", "routes/logout.tsx"),
] satisfies RouteConfig;
