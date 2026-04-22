# Changelog

All notable changes to Shrimper appear here.
Format follows [Keep a Changelog](https://keepachangelog.com/), versions follow [SemVer](https://semver.org/).

## [Unreleased]

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

[Unreleased]: https://github.com/ra100/shrimper/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/ra100/shrimper/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/ra100/shrimper/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ra100/shrimper/releases/tag/v0.1.0
