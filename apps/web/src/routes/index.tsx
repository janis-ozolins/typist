import { createFileRoute, redirect } from "@tanstack/react-router";

import { TypingPractice } from "../typing-practice";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    const to = context.landingPath();

    if (to !== undefined && to !== "" && to !== "/") {
      // oxlint-disable-next-line typescript/only-throw-error -- TanStack Router's redirect is thrown, by design
      throw redirect({ href: to });
    }
  },
  component: TypingPractice,
});
