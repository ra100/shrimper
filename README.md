# 🦐 Shrimper — Don't Sit Like a Shrimp!

A fun posture & health reminder app that nags you (lovingly) to sit straight, stretch, and take breaks. Your shrimp character evolves as you comply — and gets visibly sad when you don't.

**[Try it live](https://ra100.github.io/shrimper/)**

![Level 1 — Sad Shrimp](https://img.shields.io/badge/Level_1-Sad_Shrimp-e8a090) ![Level 5 — Champion Shrimp](https://img.shields.io/badge/Level_5-Champion_Shrimp-ffc575)

## How It Works

1. **Set your reminder interval** (e.g. every 15–45 minutes)
2. **Keep the tab open** while you work
3. **Get a popup reminder** with a posture or health tip
4. **Click "Done!"** to earn XP and keep your shrimp happy
5. **Watch your shrimp evolve** from a sad curled-up creature to a proud Champion Shrimp

## Features

- **Randomized reminders** — fires at random times within your configured range, so you can't predict and ignore them
- **10 curated tips** — sit straight, stretch, drink water, unclench your jaw, relax your wrists, and more
- **OS notifications** — real system popups via the Notification API, even when you're in another app
- **Escalation** — ignore reminders and they get more frequent. Complete them and the interval relaxes
- **XP & Leveling** — earn XP for completing reminders, bonus XP for streaks. XP never goes down.
- **5 evolution stages** — Sad Shrimp → Waking Shrimp → Trying Shrimp → Strong Shrimp → Champion Shrimp
- **Visual mood system** — your shrimp gets sad and dull when you ignore reminders, happy and vibrant when you comply
- **Snooze** — 10 min / 30 min / 1 hour options (max 2 per reminder)
- **Level-up celebrations** — animated overlay when your shrimp evolves
- **Zero backend** — everything runs in your browser, state saved in localStorage

## Tech Stack

- TypeScript + Vite (vanilla, no framework)
- Inline SVG characters generated in code
- localStorage for persistence
- GitHub Pages for hosting
- Notification API for system popups

## Development

```bash
npm install
npm run dev      # http://localhost:5173/shrimper/
npm run build    # Type-check + production build
npm run preview  # Preview production build
```

## Deploy

Push to `main` on GitHub. The included GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically builds and deploys to GitHub Pages.

To set up:
1. Create a GitHub repo called `shrimper`
2. Push this code to `main`
3. Go to Settings → Pages → Source: **GitHub Actions**
4. Your app will be live at `https://<your-username>.github.io/shrimper/`

## Philosophy

- **XP only goes up** — you're never punished by losing progress. The shrimp gets sad, but your hard-earned XP is permanent.
- **Gentle pressure, not punishment** — escalation makes reminders more frequent when ignored, but a single "Done!" starts restoring the rhythm.
- **Cozy, not clinical** — this should feel like a little game, not a health app lecturing you.

## License

[WTFPL](LICENSE) — Do What The Fuck You Want To Public License
