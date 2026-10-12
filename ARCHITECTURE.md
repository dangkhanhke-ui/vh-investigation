# VH — Investigation web

## Source layout

- `index.html` — page structure, markup and script loading order.
- `styles.css` — existing visual design and responsive styles (kept unchanged during refactor).
- `js/case-data.js` — stage text, objectives, answer keys, hints and reports. Edit game content here.
- `js/state.js` — saved progress, state, helpers and storage key.
- `js/render.js` — folder questions, choices, chat preview and chat rendering.
- `js/chat.js` — chat open/close, replies and notifications.
- `js/game.js` — answer validation, hints, progress and stage reports.
- `app.js` — DOM event bindings and startup.
- `assets/` — background, avatar and UI artwork.
- `vercel.json` — hosting configuration.

## Workflow

Work on the `dev` branch. The Vercel production site tracks `main`; merge only after testing. No visual redesign or gameplay-content changes are intended in this refactor.

## Loading

This is a static site with classic deferred scripts. **Script order matters**: case data → state → render → chat → game → app. Keep this order unless migrating all modules to ES modules.

## Note

The case content currently includes demonstration questions and client-side answer keys. Avoid treating the client-side answer keys as secure against inspection.
