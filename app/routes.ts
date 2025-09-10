import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/dress-guesser", "routes/dress-guesser.tsx"),
] satisfies RouteConfig;
