# Changelog

All notable changes to Shrimper appear here.
Format follows [Keep a Changelog](https://keepachangelog.com/), versions follow [SemVer](https://semver.org/).

## [Unreleased]

## [0.5.0] — 2026-04-24

### Added

- 🎟️ **Perks system** — earn 1 perk token per 10 completions-in-a-row (cap 3), spend tokens from the new Perks button on the dashboard. Six consumable perks, all costing 1 token:
  - 🩹 **First Aid** — restore posture to 50%
  - 🔗 **Streak Shield** — survive one missed day without breaking your streak (arm in advance)
  - ⏪ **Rewind** — within 5 min of ignoring a reminder, undo the penalty and restore the combo
  - 😴 **Free Snooze** — your next snooze counts as a full completion (+3)
  - ⏭️ **Skip** — the next reminder fires silently; no penalty, no streak break
  - ⏸️ **Grace Hour** — pause auto-decay for 1 hour (reminders keep firing)
- Schema bump **v2 → v3** with non-destructive migration: existing streaks, condition, and achievements preserved; `perkTokens: 0` added.

### Fixed

- 🐛 **Ambient bubbles now float above the shrimp** instead of being painted behind it. The animated character's `transform` established a stacking context that swallowed the bubble layer; explicit `z-index` on `.bubble-layer` restores the "rising in front of Kevin" effect.

## [0.4.1] — 2026-04-23

### Fixed

- 🐛 **Settings panel now scrolls** on short viewports — previously the backdrop scrolled the dashboard behind it, which could cause an accidental tap on "Reset All Progress".

## [0.4.0] — 2026-04-23

### Added

- 🔒 **Pause on screen lock** (opt-in) — new settings toggle uses Chrome's Idle Detection API to pause the reminder timer and decay while the screen is locked, then resumes with the same remaining delay on unlock. Chromium-only; requires permission grant.

### Changed

- 🕒 **Decay resumes from "now" after big gaps** — if the wall clock jumps forward by more than two decay intervals (machine sleep, laptop lid closed, heavy tab throttling), we cap retroactive decay at two ticks and realign the anchor. Prevents the shrimp from rotting six hours' worth of penalty the moment you wake the laptop.

## [0.3.0] — 2026-04-22

### Added

- 🔄 **Auto-update check** — app polls the deployed `version.json` every 5 minutes (and whenever the tab becomes visible). When a new version is live, a dismissible banner offers a one-click reload.

### Internal

- Vite build now emits `dist/version.json` alongside bundles for runtime version discovery.

## [0.2.0] — 2026-04-22

### Added

- 🦐 **Name your shrimp** — onboarding prompts for a name (defaults to Kevin). Notifications and quips use it.
- 💭 **Ambient thought bubbles** — shrimp shares mood-gated thoughts on the dashboard.
- 🫧 **Idle bob + bubbles** — character gently sways, bubbles drift up for a living-tank feel.
- 🏆 **Hidden achievements** — Night Owl, Early Bird, Comeback Kid, Speed Shrimp. Stay cloaked until unlocked.
- 📜 **In-app changelog** — click the version in settings to browse what's new. Auto-opens once after each update.
- 🕒 **Auto-decay** — ignoring a reminder for 3+ min now drops condition progressively instead of staying frozen.

### Changed

- 🔔 Notifications now use `requireInteraction` so Chromium-based browsers keep them on-screen.
- 📝 Notification troubleshooting guide reordered — Focus/DND moved to step 1 (real-world #1 culprit).

### Internal

- Added `AGENTS.md` with release discipline, commit style, and preflight checklist.
- Exposed `__APP_VERSION__` via Vite define for runtime version display.

## [0.1.0] — 2026-04-21

Initial public build.

### Added

- Randomized posture reminders with snooze + dismiss
- Parametric SVG shrimp reflecting condition (0–100)
- Achievements: First Stretch, Triple Threat, Weekly Warrior, Monthly Master, Century Shrimp, Peak Posture
- Streak + completions tracking
- Escalating interval on ignore, de-escalating on complete
- Browser notifications + tab title flash when unfocused
- localStorage persistence
- Onboarding flow
- Test notification button in settings

[Unreleased]: https://github.com/ra100/shrimper/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/ra100/shrimper/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/ra100/shrimper/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/ra100/shrimper/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/ra100/shrimper/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/ra100/shrimper/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ra100/shrimper/releases/tag/v0.1.0
