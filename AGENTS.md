# AGENTS.md

Typist is a single-page typing-practice app. The minimal look is the product, not an unfinished
state.

## Design rules

1. **No new UI or visible copy without an explicit user request.** No menus, navigation,
   sidebars, modals, or decoration.
2. **No new screens or routes.** Single page at `/`.
3. **Do not restyle what exists.** Dark background, JetBrains Mono, Mistral orange, inline
   styles — this is the design. No polish or cleanup passes.
4. **When in doubt, subtract.** If a change adds something the user did not name, stop.
