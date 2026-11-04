# typist

A typing-practice app on the Mistral apps stack: a TanStack Start web app (`apps/web`) that serves a
single page at `/`.

## Features

- 11 preset texts to choose from: famous book openings (Austen, Dickens, Orwell, Melville, Fitzgerald, Shakespeare, Tolkien) and code snippets (quicksort, binary search, debounce, FizzBuzz), each 100–500 characters
- Per-character visualization on the text: dim = not typed yet, bright = typed correctly, red = mistake, blinking caret = current position, plus a progress bar on top of the text card
- Live stats: current CPM (rolling 10 s window), overall CPM, accuracy, error count, elapsed time, progress %
- Completion summary with avg CPM / accuracy / errors and a restart button

## Where things live

| Path | What |
| --- | --- |
| `apps/web/src/routes/index.tsx` | The `/` route; renders the typing app |
| `apps/web/src/typing-practice.tsx` | The typing app component: texts, input handling, stats |
| `apps/web/src/typing-practice.css` | Its styles; JetBrains Mono, dark minimal theme with Mistral orange accents |
| `apps/web/src/index.css` | The Tailwind entry point and global styles |
| `mistral.json` | The app manifest: the `web` module, its port and build |

## Run

```bash
bun run install-all   # once: JS and Python dependencies
bun run dev:web       # serves the app on http://localhost:3001
```

Other targets: `bun run build`, `bun run test`. `mistral apps dev` runs the web app with the rest of
the app.
