# Shrimper Plans.md

作成日: 2026-04-15

---

## Phase 1: Project Scaffold & Core Timer

Purpose: Get a working Vite app with the reminder timer loop — the heartbeat of everything else.

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 1.1 | Vite + vanilla TS project setup with GitHub Pages deploy config | `npm run build` succeeds, `npm run dev` serves locally, `vite.config.ts` has correct `base` for GH Pages | - | cc:完了 |
| 1.2 | localStorage state module — settings (min/max interval) and XP/level persistence | State loads on refresh, persists across page reloads, typed interface for all stored data | 1.1 | cc:完了 |
| 1.3 | Reminder timer engine — random interval within min/max range, fires callback | Timer fires at random intervals within configured range, clearable, testable in isolation | 1.1 | cc:完了 |
| 1.4 | Escalation logic — shrink interval on dismiss, restore on complete | After 3 consecutive dismissals, interval is noticeably shorter; after 3 completions, interval restores toward midpoint. Unit tests pass. | 1.3 | cc:完了 |
| 1.5 | Reminder tip pool — random selection avoiding immediate repeats | 10 tips in pool, no same-tip twice in a row, returns tip object with text | 1.1 | cc:完了 |

## Phase 2: UI Shell & Reminder Overlay

Purpose: Visible app with the core interaction loop — reminder fires, user responds, cycle repeats.

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 2.1 | Dashboard layout — centered character area, XP bar, stats, settings gear [feature:a11y] | Responsive layout renders on desktop and mobile viewport, all sections visible | Phase 1 | cc:完了 |
| 2.2 | Reminder overlay — full-screen modal with tip, action buttons (Done / Snooze / Dismiss) [feature:a11y] | Overlay appears on timer fire, "Done" grants XP + closes, "Dismiss" closes without XP, snooze options (10m/30m/1h) reschedule timer | 2.1, 1.3, 1.5 | cc:完了 |
| 2.3 | Tab unfocused indicator — flashing document title + favicon swap on pending reminder | When tab is not focused and reminder fires, title flashes "🦐 Time to stretch!" and favicon changes. Reverts on focus. | 2.2 | cc:完了 |
| 2.4 | Snooze mechanics — delay current reminder by selected duration, no escalation penalty | Snooze reschedules the current reminder; new random reminders continue independently; max 2 snoozes per reminder before auto-dismiss | 2.2, 1.4 | cc:完了 |
| 2.5 | Settings panel — min/max interval sliders, reset progress with confirmation dialog [feature:a11y] | Settings changes persist to localStorage, apply to next reminder interval. Reset clears all XP/level data after confirmation. | 2.1, 1.2 | cc:完了 |

## Phase 3: XP System & Stats

Purpose: Make completing reminders feel rewarding with visible progress.

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 3.1 | XP engine — earn XP on complete, bonus for streaks, XP only goes up | Base XP (10) on complete. Streak bonus: +2 per consecutive complete (cap at +10). XP never decreases. Unit tests pass. | 1.2 | cc:TODO |
| 3.2 | Level system — 5 levels with thresholds, level derived from XP | Levels: 0/50/150/400/1000 XP. Level computed from current XP. Level-up event emitted. | 3.1 | cc:TODO |
| 3.3 | XP progress bar — animated bar showing progress within current level | Bar fills proportionally between current and next level threshold. Animates on XP gain. | 2.1, 3.2 | cc:TODO |
| 3.4 | Stats display — today's XP, total XP, level, completions today, current streak | Stats update in real-time on dashboard. "Today" resets at midnight local time. Streak = consecutive completed reminders (breaks on dismiss/ignore). | 2.1, 3.1 | cc:TODO |
| 3.5 | Approximate countdown — "Next reminder in ~X min" display on dashboard | Shows approximate time until next reminder. Updates every 30 seconds. Doesn't reveal exact random time (shows range bucket: "soon" / "a few minutes" / "a while"). | 2.1, 1.3 | cc:TODO |

## Phase 4: Shrimp Character

Purpose: The emotional core — make the shrimp feel alive and responsive.

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 4.1 | SVG shrimp — 5 evolution stage base poses (sad → champion) [skip:tdd] | 5 distinct SVG files/components, each visually progressing from curled to upright. Clean lines, soft colors, expressive faces. | - | cc:TODO |
| 4.2 | Mood overlay system — happy/neutral/sad expression variants per stage [skip:tdd] | Each stage has 3 mood variants (happy, neutral, sad). Mood is CSS-class driven, swappable without replacing SVG. | 4.1 | cc:TODO |
| 4.3 | CSS animations — idle breathing, wiggle on reminder, celebration on XP gain [skip:tdd] | Idle breathing loops continuously. Wiggle triggers on reminder fire. Celebration plays on "Done" click. All smooth 60fps. | 4.1 | cc:TODO |
| 4.4 | Character state manager — maps XP level + recent behavior to stage + mood | Character shows correct evolution stage for current level. Mood degrades after 3+ consecutive ignored reminders (sad eyes, dull colors). Mood recovers after 2 consecutive completions. | 3.2, 4.2 | cc:TODO |
| 4.5 | Integrate character into dashboard — large, centered, animated, responsive | Character renders at correct stage + mood, animations play, scales properly on mobile. | 2.1, 4.1, 4.3, 4.4 | cc:TODO |

## Phase 5: First-Run & Polish

Purpose: Make the first experience delightful and the whole app feel finished.

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 5.1 | First-run onboarding — welcome screen, interval setup, start button [feature:a11y] | On first visit (no localStorage data), show welcome flow: app concept → set intervals → "Start" button. Dashboard appears after. | 2.1, 2.5, 1.2 | cc:TODO |
| 5.2 | Character quips — pool of short phrases per tip, displayed in overlay | Each reminder tip has 2-3 matching character quips (e.g., "Don't be a shrimp! 🦐"). Random quip shown alongside tip in overlay. | 2.2, 1.5 | cc:TODO |
| 5.3 | Level-up celebration — special animation + message on evolution | When XP crosses a level threshold, show a celebratory overlay with new character stage reveal and congratulations message. | 3.2, 4.4, 4.3 | cc:TODO |
| 5.4 | Visual polish — color palette, typography, spacing, favicon, meta tags [skip:tdd] | Consistent soft muted color palette. Clean typography. Proper favicon (shrimp). OG meta tags for sharing. Feels like a cozy indie game. | Phase 4 | cc:TODO |
| 5.5 | GitHub Pages deploy — GitHub Actions workflow, working production URL [skip:tdd] | `git push` to main triggers deploy. App accessible at `username.github.io/shrimper`. All features work in production build. | Phase 4 | cc:TODO |
| 5.6 | Manual QA pass — test full loop on desktop Chrome + mobile Safari | Full reminder cycle works: fire → overlay → done/snooze/dismiss → XP updates → character reacts → next reminder fires. No console errors. | 5.1, 5.2, 5.3, 5.4, 5.5 | cc:TODO |
