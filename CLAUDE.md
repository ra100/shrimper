# Shrimper

Posture & health reminder app with gamification. Reminds you to sit straight, stretch, and take breaks. Your shrimp character evolves as you comply.

## Tech Stack

- **TypeScript** + **Vite** (vanilla, no framework)
- Static site deployed to **GitHub Pages**
- All state in **localStorage** (no backend)

## Development

### Setup

```bash
npm install
```

### Commands

```bash
npm run dev      # Start dev server (http://localhost:5173/shrimper/)
npm run build    # Type-check + production build
npm run preview  # Preview production build
```

## Architecture

- `src/state.ts` — localStorage persistence, XP/level logic, typed state interface
- `src/timer.ts` — Randomized reminder timer with snooze support
- `src/escalation.ts` — Interval escalation (shrink on ignore, restore on complete)
- `src/tips.ts` — Curated tip pool with quips, no-repeat selection
- `src/characters/shrimp.ts` — SVG shrimp renderer (5 stages × 3 moods)
- `src/ui.ts` — All DOM rendering (dashboard, overlay, settings, onboarding, level-up)
- `src/app.ts` — App orchestrator wiring all modules
- `src/tab-indicator.ts` — Flashing title for unfocused tab

## Conventions

- Use gitmojis in commit messages
- XP only goes up — punishment is visual (sad shrimp) + escalation, never XP loss
- Reminders only fire while tab is open (no service worker/push notifications)
- SVG characters are generated in code, not external assets
