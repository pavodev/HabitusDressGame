import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300..900;1,300..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Trirong:ital,wght@0,100..900;1,100..900&display=swap",
  },
  {
    rel: "icon", type: "image/png", href: "/icon/favicon-96x96.png", sizes: "96x96"
  },
  { rel: "icon", type: "image/svg+xml", href: "/icon/favicon.svg" },
  { rel: "shortcut icon", href: "/icon/favicon.ico" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/icon/apple-touch-icon.png" },
  { rel: "manifest", href: "/icon/site.webmanifest" },
];

export const meta: Route.MetaFunction = () => [
  { name: "apple-mobile-web-app-title", content: "Habitus Fidei Quiz" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
