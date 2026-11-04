# typist

A minimal typing-practice mini app in the Mistral Vibe mini-app format: a self-contained React app that renders in the Canvas panel.

- `index.js` — the app (default-exported React component)
- `styles.css` — styles; JetBrains Mono, dark minimal theme with Mistral orange accents

## Features

- 11 preset texts to choose from: famous book openings (Austen, Dickens, Orwell, Melville, Fitzgerald, Shakespeare, Tolkien) and code snippets (quicksort, binary search, debounce, FizzBuzz), each 100–500 characters
- Per-character visualization on the text: dim = not typed yet, bright = typed correctly, red = mistake, blinking caret = current position, plus a progress bar on top of the text card
- Live stats: current CPM (rolling 10 s window), overall CPM, accuracy, error count, elapsed time, progress %
- Completion summary with avg CPM / accuracy / errors and a restart button

## Run

Create a mini app in Vibe Work and use these two files as its source, or serve them from any static host with an `index.html` shell that provides React.
