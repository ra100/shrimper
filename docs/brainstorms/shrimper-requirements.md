# Shrimper — Posture & Health Reminder App

**Date:** 2026-04-15
**Status:** Draft
**Author:** Brainstorm session

---

## Problem

People who work at computers for long hours develop poor posture habits — hunching ("shrimping"), forward neck, sitting without breaks. Existing reminder tools are either too clinical, too annoying, or too easy to ignore. There's no fun incentive to actually comply.

## Solution

A lightweight web app deployed on GitHub Pages that reminds users at randomized intervals to fix their posture, stretch, and take breaks. Compliance earns XP and evolves a shrimp character from a sad curled-up creature into a proud upright one. Ignoring reminders causes the character to visually degrade (sad expressions, slumping) and reminder frequency to escalate — but XP is never lost.

## Target User

Solo developer / knowledge worker who spends 6+ hours daily at a computer and wants a fun, low-friction way to build better posture habits.

## Platform & Deployment

- **Static web app** — HTML/CSS/JS, no backend
- **GitHub Pages** — zero hosting cost, deploy from repo
- **All state client-side** — localStorage for settings and progress, no accounts or servers
- **Tab must be open** — reminders fire via in-page timers while the tab/window is open. No background push notifications (would require a server). This is an acceptable v1 limitation for a POC.

## Core Features

### 1. Randomized Reminders

- User sets a **min and max interval** (e.g. 15–45 minutes)
- Each reminder fires at a random time within that range
- **Escalation:** if a reminder is dismissed without completing the action (or ignored entirely), the next interval shrinks toward the minimum. "Dismissed" means closing the overlay or notification without completing and without selecting snooze. Snoozed reminders are excluded from dismissal (no escalation penalty).
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

- **In-app overlay** — full-screen reminder with the tip, character reaction, and action buttons. This is the primary (and only v1) notification method.
- Reminders only fire while the tab/window is open — no background push notifications in v1
- If the tab is not focused, use the document title and favicon to signal a pending reminder (e.g. flashing title "🦐 Time to stretch!")
- Character quip accompanies each reminder tip

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
- **Visual degradation (not level loss):** ignoring reminders makes the character visually sad/slumpy within its current stage (droopy eyes, frown, dull colors) but does NOT drop it to a lower evolution stage. XP is never lost. The character recovers its happy appearance when the user starts completing reminders again.
- Character is the emotional center — users should feel guilty letting it look sad, but never punished by losing hard-earned progress

### 5. XP & Leveling

- **Earn XP** for completing a reminder action (clicking "Done!" / "I stretched!" etc.)
- **Bonus XP** for streaks of consecutive completed reminders
- **XP thresholds** for each evolution stage (tunable, but roughly: 0 / 50 / 150 / 400 / 1000)
- **XP only goes up** — no decay, no loss. Progress is permanent. The punishment for neglect is visual (sad shrimp) and frequency-based (escalation), not XP-based.
- Simple **stats panel:** today's XP, total XP, current level, reminders completed today, current streak

### 6. Dashboard / Main Screen

- Shrimp character front and center, large and animated
- Current level and XP progress bar
- Next reminder countdown (approximate, since it's random)
- Stats summary (today's completions, streak)
- Settings gear icon

### 7. Settings

- Min/max reminder interval (in minutes)
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

- Pure static site — minimal build via Vite
- GitHub Pages compatible
- All state in localStorage
- SVG characters inline or as components
- No service worker needed for v1 (no background notifications, no offline requirement)

## Success Criteria

- Reminders fire reliably while tab is open
- Escalation mechanic creates gentle pressure without being annoying
- Character evolution is visible and emotionally engaging within the first session
- Character visual mood responds noticeably to user behavior (happy when completing, sad when ignoring)
- Snooze works without breaking the reminder loop
- App loads fast, deploys to GitHub Pages with minimal config

## Open Questions

- Exact XP values per action and per level — tune after initial testing
- Whether to add sound effects for reminders — optional for v1
- Daily summary / history view — nice to have, skip for v1 unless trivial
