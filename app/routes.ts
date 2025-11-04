import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/dress-guesser/:lang?", "routes/dress-guesser.tsx"),
  // route("/dress-guesser-hints", "routes/dress-guesser-hints.tsx"),
  // route("/dress-guesser-survival", "routes/dress-guesser-survival.tsx"),
] satisfies RouteConfig;
