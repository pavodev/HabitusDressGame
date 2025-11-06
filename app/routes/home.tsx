import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Habitus Fidei Quiz" },
    { name: "description", content: "Benvenuta/o nel quiz della mostra Habitus Fidei! / Welcome to the quiz of the Habitus Fidei exhibition!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
