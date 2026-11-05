import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import { DEFAULT_APP_NAME } from "../app-name";

import appCss from "../index.css?url";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import font400 from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2?url";
import font500 from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2?url";


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
      // Self-hosted JetBrains Mono: preload the two weights the UI uses so
      // they fetch in parallel with the CSS/JS, same-origin, no third party.
      { rel: "preload", as: "font", type: "font/woff2", href: font400, crossOrigin: "anonymous" },
      { rel: "preload", as: "font", type: "font/woff2", href: font500, crossOrigin: "anonymous" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  shellComponent: RootDocument,
});
