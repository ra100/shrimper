# Shrimper — Posture & Health Reminder App

**Date:** 2026-04-15
**Status:** Draft
**Author:** Brainstorm session

---

## Problem

People who work at computers for long hours develop poor posture habits — hunching ("shrimping"), forward neck, sitting without breaks. Existing reminder tools are either too clinical, too annoying, or too easy to ignore. There's no fun incentive to actually comply.

## Solution

A lightweight web app (PWA) deployed on GitHub Pages that reminds users at randomized intervals to fix their posture, stretch, and take breaks. Compliance earns XP and evolves a shrimp character from a sad curled-up creature into a proud upright one. Ignoring reminders causes the character to regress and reminder frequency to escalate.

## Target User

Solo developer / knowledge worker who spends 6+ hours daily at a computer and wants a fun, low-friction way to build better posture habits.

## Platform & Deployment

- **Static web app (PWA)** — HTML/CSS/JS, no backend
- **GitHub Pages** — zero hosting cost, deploy from repo
- **All state client-side** — localStorage for settings and progress, no accounts or servers
- **Works offline** via service worker

## Core Features

### 1. Randomized Reminders

- User sets a **min and max interval** (e.g. 15–45 minutes)
- Each reminder fires at a random time within that range
- **Escalation:** if a reminder is dismissed without completing the action (or ignored entirely), the next interval shrinks toward the minimum
- **Good behavior:** completing reminders lets the interval drift back toward normal range
- Reminders are a **curated pool of tips:**
  - Sit up straight
  - Pull shoulders back
  - Don't push neck forward
  - Stand up and stretch
  - Look away from screen (20-20-20 rule)
  - Take a short walk
  - Drink water
  - Adjust monitor height
  - Unclench your jaw
  - Relax your hands/wrists

### 2. Notification System

- **Browser Notifications** — system-level, work when tab is in background
- **In-app overlay** — when user clicks through to the app, a full-screen reminder with the tip, character reaction, and action buttons
- Notification text includes the tip and a short character quip

### 3. Snooze

- Each reminder has snooze options: **10 min / 30 min / 1 hour**
- Snooze delays that specific reminder; does not stop future ones
- Snoozed reminders don't count as ignored (no escalation penalty)

### 4. Shrimp Character (SVG, animated)

- **~5 evolution stages** based on XP level:
  1. **Sad Shrimp** — fully curled, droopy eyes (Level 1)
  2. **Waking Shrimp** — slightly less curled, one eye open (Level 2)
  3. **Trying Shrimp** — upright-ish, wobbly, hopeful expression (Level 3)
  4. **Strong Shrimp** — standing tall, confident smile (Level 4)
  5. **Champion Shrimp** — fully upright, maybe a tiny crown or glow (Level 5)
- SVG with CSS animations: idle breathing, wiggle on reminder, celebration on XP gain
- **Regression:** extended neglect (many ignored reminders) causes the character to drop a stage
- Character is the emotional center — users should feel guilty letting it curl up

### 5. XP & Leveling

- **Earn XP** for completing a reminder action (clicking "Done!" / "I stretched!" etc.)
- **Bonus XP** for streaks of consecutive completed reminders
- **XP thresholds** for each evolution stage (tunable, but roughly: 0 / 50 / 150 / 400 / 1000)
- **XP decay** — slow passive decay if the app isn't used for a day, so progress requires ongoing engagement
- Simple **stats panel:** today's XP, total XP, current level, reminders completed today, current streak

### 6. Dashboard / Main Screen

- Shrimp character front and center, large and animated
- Current level and XP progress bar
- Next reminder countdown (approximate, since it's random)
- Stats summary (today's completions, streak)
- Settings gear icon

### 7. Settings

- Min/max reminder interval (in minutes)
- Notification permission toggle
- Reset progress (with confirmation)

## Non-Goals (v1)

- No accounts, no server, no database
- No calendar integration or auto-DND
- No multiplayer / social / leaderboards
- No mobile-native app (PWA handles mobile browsers)
- No AI-powered posture detection via camera
- No custom reminder text editing

## Visual Style

- **Modern indie illustrated** — clean SVG lines, soft muted color palette, expressive character
- Not pixel art, not corporate, not clinical
- Light/friendly UI — the app should feel like a cozy game, not a health tool
- Simple animations to add life (character breathes, wiggles, celebrates)

## Technical Constraints

- Pure static site — no build step required for v1 (or minimal: Vite at most)
- GitHub Pages compatible
- PWA with service worker for offline + notifications
- All state in localStorage
- SVG characters inline or as components

## Success Criteria

- Reminders actually reach the user (notification permission flow works reliably)
- Escalation mechanic creates gentle pressure without being annoying
- Character evolution is visible and emotionally engaging within the first session
- Snooze works without breaking the reminder loop
- App loads fast, works offline, deploys to GitHub Pages with zero config

## Open Questions

- Exact XP values per action and per level — tune after initial testing
- Whether to add sound effects for reminders (mentioned in settings, but optional for v1)
- Daily summary / history view — nice to have, skip for v1 unless trivial
