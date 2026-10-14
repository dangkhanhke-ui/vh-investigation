# VH phone — pinned source of truth

The checked-in `phone/` directory on the `main` branch is the **only** phone runtime served to players.

## Rules
- Do not clone or sync `caua-phone-preview` into this repository's phone directory.
- Do not automatically regenerate, delete, or replace `phone/` as a side effect of changes to `index.html`, avatar assets, intro, or messages.
- The former destructive build workflow was replaced with a read-only, manually invoked check. GitHub Pages deploys committed static files directly.
- Edit `phone/index.html`, `phone/css/`, and `phone/js/` intentionally in this repository. Treat `phone-overrides/` as legacy source material, not a competing build input.
- A separate source repository must never be treated as the automatically updating phone source.
- Commit and review changes to the phone independently, verifying appearance and behavior before release.

## Pinned baseline
Baseline: `9c592a0d4562de4edac5e68621c34dc624ca537a` (phone tree before disabling the build).
`phone/index.html` Git blob: `0eab9ab0daa28c4ea5518cc2ce5b413729161def`.

This pins source ownership and protects against unintended regeneration; it does **not** assert that all existing visual or messaging bugs have been fixed.
