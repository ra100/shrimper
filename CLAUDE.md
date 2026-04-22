# Shrimper

Posture & health reminder app with gamification. Reminds you to sit straight, stretch, and take breaks. Your shrimp character's posture reflects how well you're keeping up — slouch reminders and it curls, attend to them and it straightens.

> **Claude: read [`AGENTS.md`](./AGENTS.md) before making changes.** It defines release discipline, versioning, CHANGELOG, commit style, and preflight checks that apply to every change in this repo.

## Tech Stack

- **TypeScript** + **Vite** (vanilla, no framework)
- Static site deployed to **GitHub Pages**
- All state in **localStorage** (no backend)

## Commands

```bash
pnpm install     # First-time setup
pnpm dev         # Start dev server (http://localhost:5173/shrimper/)
pnpm build       # Type-check + production build
pnpm preview     # Preview production build
pnpm check       # Biome lint + format (writes)
pnpm lint        # Biome lint only
pnpm knip        # Detect dead code + unused deps
```

## Architecture

- `src/state.ts` — localStorage persistence, condition + achievements logic, typed state interface
- `src/timer.ts` — Randomized reminder timer with snooze support
- `src/escalation.ts` — Interval escalation (shrink on ignore, restore on complete)
- `src/tips.ts` — Curated tip pool with quips, no-repeat selection
- `src/characters/shrimp.ts` — Parametric SVG shrimp driven by condition scalar
- `src/achievements.ts` — Achievement metadata + celebration queue
- `src/ui.ts` — All DOM rendering (dashboard, overlay, settings, onboarding, achievements grid)
- `src/app.ts` — App orchestrator wiring all modules
- `src/tab-indicator.ts` — Flashing title for unfocused tab
- `src/notifications.ts` — Browser Notification API wrapper

## Gameplay invariants

- Condition is bidirectional (0..100) — completions raise it (+3, or +1 if snoozed first), ignores lower it (−4). Clamped both ends.
- Auto-decay: unanswered reminder drops condition −3 every 3 minutes until resolved.
- Achievements are permanent ratchets — once unlocked, never un-unlock.
- Reminders only fire while tab is open (no service worker/push notifications).
- SVG characters are generated in code, not external assets.

## Dev process

See **[`AGENTS.md`](./AGENTS.md)** for:

- SemVer + CHANGELOG rules
- Commit style (gitmoji)
- Preflight checklist
- Release flow
