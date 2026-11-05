# typist

A typing-practice app on the Mistral apps stack: a TanStack Start web app (`apps/web`) that serves a
single page at `/`.

## Features

- 9 preset texts split into Prose and Code tabs: famous book openings (Dickens, Austen, Orwell, Melville, Carroll) and code snippets (FizzBuzz, quicksort, binary search, debounce)
- Per-character visualization on the text: dim = not typed yet, grey = typed correctly, red = mistake, pulsing orange caret = current position, plus a progress bar on top of the text card
- Live stats: current CPM (rolling window), overall CPM, accuracy, error count, elapsed time
- Completion overlay with avg CPM / accuracy / errors / time, plus retry and next-text buttons

## Where things live

| Path | What |
| --- | --- |
| `apps/web/src/routes/index.tsx` | The `/` route; renders the typing app |
| `apps/web/src/typing-practice.tsx` | The typing app component: texts, keyboard handling, stats, and inline styles (JetBrains Mono, dark minimal theme with Mistral orange accents) |
| `apps/web/src/index.css` | The Tailwind entry point and global styles |
| `mistral.json` | The app manifest: the `web` module, its port and build |

## Run

```bash
bun run install-all   # once: JS and Python dependencies
bun run dev:web       # serves the app on http://localhost:3001
```

Other targets: `bun run build`, `bun run test`. `mistral apps dev` runs the web app with the rest of
the app.
