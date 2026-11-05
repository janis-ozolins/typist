import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import { DEFAULT_APP_NAME } from "../app-name";

import appCss from "../index.css?url";


export interface RouterContext {
  queryClient: QueryClient;
  /** Where `/` sends the user; see `landing.ts`. */
  landingPath: () => string | undefined;
  /** The app's display name; see `app-name.ts`. Absent only in a test's hand-built router. */
  appName?: string;
}

/**
 * The HTML document. Layout belongs in a layout route, not here: wrap pages in a pathless
 * `routes/_<name>.tsx` so a page can opt out of it by living outside that directory.
 *
 * `suppressHydrationWarning` covers attributes a script sets on `<html>` before React hydrates,
 * such as the theme class.
 */
const RootDocument = ({ children }: { children: ReactNode }) => (
  <html lang="en" suppressHydrationWarning>
    <head>
      <HeadContent />
    </head>
    <body>
      {children}
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRouteWithContext<RouterContext>()({
  head: ({ match }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: match.context.appName ?? DEFAULT_APP_NAME },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Discover and fetch the font stylesheet at HTML parse time, in parallel
      // with the JS bundle, instead of waiting for hydration to inject it.
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500&display=swap",
      },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  shellComponent: RootDocument,
});
