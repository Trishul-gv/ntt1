import { createFileRoute, redirect } from "@tanstack/react-router";

// The site is a plain HTML/CSS/JS project served from /public.
// "/" simply forwards to the static home page.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ href: "/index.html" });
  },
  component: () => null,
});
