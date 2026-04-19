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
| 3.1 | XP engine — earn XP on complete, bonus for streaks, XP only goes up | Base XP (10) on complete. Streak bonus: +2 per consecutive complete (cap at +10). XP never decreases. Unit tests pass. | 1.2 | cc:完了 |
| 3.2 | Level system — 5 levels with thresholds, level derived from XP | Levels: 0/50/150/400/1000 XP. Level computed from current XP. Level-up event emitted. | 3.1 | cc:完了 |
| 3.3 | XP progress bar — animated bar showing progress within current level | Bar fills proportionally between current and next level threshold. Animates on XP gain. | 2.1, 3.2 | cc:完了 |
| 3.4 | Stats display — today's XP, total XP, level, completions today, current streak | Stats update in real-time on dashboard. "Today" resets at midnight local time. Streak = consecutive completed reminders (breaks on dismiss/ignore). | 2.1, 3.1 | cc:完了 |
| 3.5 | Approximate countdown — "Next reminder in ~X min" display on dashboard | Shows approximate time until next reminder. Updates every 30 seconds. Doesn't reveal exact random time (shows range bucket: "soon" / "a few minutes" / "a while"). | 2.1, 1.3 | cc:完了 |

## Phase 4: Shrimp Character

Purpose: The emotional core — make the shrimp feel alive and responsive.

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 4.1 | SVG shrimp — 5 evolution stage base poses (sad → champion) [skip:tdd] | 5 distinct SVG files/components, each visually progressing from curled to upright. Clean lines, soft colors, expressive faces. | - | cc:完了 |
| 4.2 | Mood overlay system — happy/neutral/sad expression variants per stage [skip:tdd] | Each stage has 3 mood variants (happy, neutral, sad). Mood is CSS-class driven, swappable without replacing SVG. | 4.1 | cc:完了 |
| 4.3 | CSS animations — idle breathing, wiggle on reminder, celebration on XP gain [skip:tdd] | Idle breathing loops continuously. Wiggle triggers on reminder fire. Celebration plays on "Done" click. All smooth 60fps. | 4.1 | cc:完了 |
| 4.4 | Character state manager — maps XP level + recent behavior to stage + mood | Character shows correct evolution stage for current level. Mood degrades after 3+ consecutive ignored reminders (sad eyes, dull colors). Mood recovers after 2 consecutive completions. | 3.2, 4.2 | cc:完了 |
| 4.5 | Integrate character into dashboard — large, centered, animated, responsive | Character renders at correct stage + mood, animations play, scales properly on mobile. | 2.1, 4.1, 4.3, 4.4 | cc:完了 |

## Phase 5: First-Run & Polish

Purpose: Make the first experience delightful and the whole app feel finished.

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 5.1 | First-run onboarding — welcome screen, interval setup, start button [feature:a11y] | On first visit (no localStorage data), show welcome flow: app concept → set intervals → "Start" button. Dashboard appears after. | 2.1, 2.5, 1.2 | cc:完了 |
| 5.2 | Character quips — pool of short phrases per tip, displayed in overlay | Each reminder tip has 2-3 matching character quips (e.g., "Don't be a shrimp! 🦐"). Random quip shown alongside tip in overlay. | 2.2, 1.5 | cc:完了 |
| 5.3 | Level-up celebration — special animation + message on evolution | When XP crosses a level threshold, show a celebratory overlay with new character stage reveal and congratulations message. | 3.2, 4.4, 4.3 | cc:完了 |
| 5.4 | Visual polish — color palette, typography, spacing, favicon, meta tags [skip:tdd] | Consistent soft muted color palette. Clean typography. Proper favicon (shrimp). OG meta tags for sharing. Feels like a cozy indie game. | Phase 4 | cc:完了 |
| 5.5 | GitHub Pages deploy — GitHub Actions workflow, working production URL [skip:tdd] | `git push` to main triggers deploy. App accessible at `username.github.io/shrimper`. All features work in production build. | Phase 4 | cc:完了 |
| 5.6 | Manual QA pass — test full loop on desktop Chrome + mobile Safari | Full reminder cycle works: fire → overlay → done/snooze/dismiss → XP updates → character reacts → next reminder fires. No console errors. | 5.1, 5.2, 5.3, 5.4, 5.5 | cc:完了 |

---

# Revision R1: Condition + Achievements + Animated SVG

Added: 2026-04-19
Source: `docs/superpowers/specs/2026-04-19-condition-achievements-svg-design.md`

Replaces XP/level progression with a bidirectional `condition` scalar (0..100, start 50) plus a 6-item permanent achievements ratchet. Replaces PNG character art with a single parametric SVG driven by CSS custom properties. Deletes the abandoned Flux/ComfyUI pipeline. No migration (no existing users).

## Phase R1: State schema rewrite

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| R1.1 | In `src/state.ts`, replace `ShrimperProgress` interface: remove `xp`, `level`, `consecutiveIgnored`. Add `condition: number` (default 50), `totalCompletions: number` (default 0), `completionsInRow: number` (default 0), `achievements: { firstStretch: string\|null, threeInRow: string\|null, streak7: string\|null, streak30: string\|null, total100: string\|null, peakCondition: string\|null }` (all default null). Keep `completionsToday`, `streak`, `lastCompletionDate`. Add `version: 2` to `ShrimperState`. Update `DEFAULT_PROGRESS` to match. | `npm run build` passes with new interface | - | cc:TODO |
| R1.2 | In `src/state.ts`, rewrite `loadState()`: if parsed JSON lacks `version` field or `version !== 2`, discard and return fresh defaults. Remove exports `XP_THRESHOLDS`, `STREAK_BONUS_PER`, `STREAK_BONUS_CAP`, `BASE_XP`, `computeLevel`, `addXp`, `getXpForCompletion`. Update `resetProgress` to produce v2 defaults. | `grep -n "xp\\|XP_THRESHOLDS\\|computeLevel" src/state.ts` returns nothing | R1.1 | cc:TODO |
| R1.3 | In `src/state.ts`, implement `recordCompletion(state: ShrimperState, wasSnoozed: boolean): { state: ShrimperState; unlocked: string[] }`. Delta = `wasSnoozed ? 1 : 3`. Apply: `condition = clamp(condition + delta, 0, 100)`, `totalCompletions++`, `completionsInRow++`. Streak: parse `lastCompletionDate`; if `=== today` keep streak + increment `completionsToday`; else if `=== yesterday` set `streak+1` and `completionsToday=1`; else set `streak=1` and `completionsToday=1`. Set `lastCompletionDate = today`. Then compute unlocked list via helper `checkAchievements`. | Manual: complete from condition=50 → 53; complete 34× → clamps at 100; new-day complete resets completionsToday to 1 | R1.2 | cc:TODO |
| R1.4 | In `src/state.ts`, implement `recordIgnored(state)`: `condition = clamp(condition - 4, 0, 100)`, `completionsInRow = 0`. Do not modify streak (streak naturally resets next day via R1.3 gap logic). | Manual: ignore from condition=50 → 46; ignore from 0 → 0 | R1.1 | cc:TODO |
| R1.5 | In `src/state.ts`, implement `recordSnooze(state): ShrimperState`: return state unchanged. Exported for API symmetry with completion/ignored. | `recordSnooze(s) === s` | R1.1 | cc:TODO |
| R1.6 | In `src/state.ts`, implement private `checkAchievements(state): string[]`. For each of 6 ids where current value is `null`: `firstStretch` if `totalCompletions === 1`; `threeInRow` if `completionsInRow === 3`; `streak7` if `streak === 7`; `streak30` if `streak === 30`; `total100` if `totalCompletions === 100`; `peakCondition` if `condition === 100`. Set matching ones to `todayString()`, push id to result. Return result list. Called inside `recordCompletion` after state mutation. | All 6 fire exactly at boundary; already-unlocked does not re-fire | R1.3 | cc:TODO |
| R1.7 | Commit Phase R1. Message: `✨ feat: replace XP/level state with condition + achievements schema`. | git log shows commit | R1.1, R1.2, R1.3, R1.4, R1.5, R1.6 | cc:TODO |

## Phase R2: SVG character rewrite

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| R2.1 | Rewrite `src/characters/shrimp.ts` completely. Remove PNG loader (`renderShrimp(stage,mood)`, `getMoodFromBehavior`, `BASE_PATH`, `Mood`, `Stage` types). Export `renderShrimp(): string` returning inline SVG per spec § Structure: `viewBox="0 0 200 200"`, class `shrimp`, groups `.antennae` (2 `.antenna` paths), `.body` containing `.segment.s1`..`.s4` plus `.tail` (each a path/group with proper transform-origin), `.face` containing two `.eye` groups (each with inner `<circle class="eyeball">` and `<rect class="eyelid">`) and `<path class="mouth smile">` and `<path class="mouth frown">`. Use soft shrimp colors. | SVG renders; all 5 segments + eyelids + two mouth paths present | - | cc:TODO |
| R2.2 | In `src/characters/shrimp.ts` export `updateShrimp(root: HTMLElement, condition: number): void`. Body: `root.style.setProperty('--c', String(Math.max(0, Math.min(1, condition/100))))`. All other visuals derive from `--c` via CSS. | Setting condition=0/50/100 reflected as `--c=0/0.5/1` in DevTools | R2.1 | cc:TODO |
| R2.3 | In `src/characters/shrimp.ts` export `flashShrimp(root: HTMLElement, kind: 'bounce' \| 'deflate'): void`. Remove class if already present, force reflow (`void root.offsetWidth`), add class, `setTimeout(() => root.classList.remove(kind), 400)`. Guards against overlapping calls. | Two rapid calls each play full animation | R2.1 | cc:TODO |
| R2.4 | In `src/style.css`, replace shrimp-character section. Add `.shrimp { --c: 0.5; filter: hue-rotate(calc((var(--c) - 0.5) * 40deg)) saturate(calc(0.5 + var(--c) * 0.7)); transition: filter 600ms ease; }`. Define `--curl: calc(1 - var(--c))` on `.shrimp`. Per segment: `.shrimp .segment { transition: transform 600ms ease; transform-origin: <joint>; }` with `.s1 { transform: rotate(calc(var(--curl) * 0deg)); }` etc. (s2:8, s3:16, s4:24, .tail:32). `.shrimp .eye { transition: transform 600ms ease; transform: translateY(calc(var(--curl) * 3px)) scaleY(calc(0.5 + var(--c) * 0.5)); }`. `.shrimp .mouth { transition: opacity 600ms ease; }`, `.shrimp .smile { opacity: var(--c); }`, `.shrimp .frown { opacity: calc(1 - var(--c)); }`. Keyframes `breathe` (0%,100% scale 1; 50% scale 1.02) on `.shrimp .body { animation: breathe 3s ease-in-out infinite; transform-origin: center; }`. Keyframes `blink` (scaleY 0 for 96%, scaleY 1 for 4%) on `.shrimp .eyelid { animation: blink 6s infinite; transform-origin: top; }`, `.shrimp .eye.right .eyelid { animation-delay: 0.3s; }`. Keyframes `bounce` (0,100 translateY 0; 50 translateY -8px) on `.shrimp.bounce { animation: bounce 400ms ease; }`. Keyframes `deflate` (applies temporary `filter: saturate(0.3)` and `--curl: 1`) on `.shrimp.deflate { animation: deflate 400ms ease; }`. Remove all old `@keyframes breathe-sad`, `.shrimp-img`, `@keyframes celebrate`. Remove `.shrimp-character { animation: breathe ... }` line (animation moves inside SVG). | At condition=0 spine fully curled; at 100 straight; breathe+blink loop independently; bounce/deflate fire; no visual conflicts | R2.1 | cc:TODO |
| R2.5 | In `src/style.css`, add `.sparkle-layer` absolute-positioned overlay wrapping shrimp and `.sparkle` particle rules using `--sparkle-x` and `--sparkle-delay` inline props. Keyframe `sparkle-pop` (0 opacity 0 translate(0,0); 30 opacity 1; 100 opacity 0 translate(var(--sparkle-x), -40px)). | Sparkle layer renders 8 particles that fade+rise when mounted | R2.4 | cc:TODO |
| R2.6 | Commit Phase R2. Message: `🎨 feat: parametric SVG shrimp driven by condition scalar`. | git log shows commit | R2.1, R2.2, R2.3, R2.4, R2.5 | cc:TODO |

## Phase R3: UI rewrite

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| R3.1 | Create `src/achievements.ts`. Export `ACHIEVEMENT_META: Record<string, { name: string; icon: string }>` with 6 entries: `firstStretch: { name: 'First Stretch', icon: '🌱' }`, `threeInRow: { name: 'Triple Threat', icon: '🎯' }`, `streak7: { name: 'Weekly Warrior', icon: '📅' }`, `streak30: { name: 'Monthly Master', icon: '🏅' }`, `total100: { name: 'Century Shrimp', icon: '💯' }`, `peakCondition: { name: 'Peak Posture', icon: '👑' }`. Export `ACHIEVEMENT_ORDER: string[]` for stable UI ordering. | Constants importable | - | cc:TODO |
| R3.2 | In `src/achievements.ts` export `celebrate(ids: string[]): void`. Maintain module-level queue + "isPlaying" flag. Each celebration: create `<div class="achievement-overlay">` with centered card `<div class="achievement-card">` containing icon + name + "Unlocked!" text; 30 `<span class="confetti">` children with inline `style="--x: ${rand}px; --delay: ${rand}s; background: ${pickColor()}"`; append to `document.body`, `requestAnimationFrame` add `.visible`; auto-dismiss timer 2500ms or on click → fade out, remove, dequeue next. | Two queued ids play sequentially; click dismisses early | R3.1 | cc:TODO |
| R3.3 | In `src/ui.ts`, update imports: drop `XP_THRESHOLDS`, drop `getMoodFromBehavior`, drop `Stage`. Add `updateShrimp`, `flashShrimp` from `./characters/shrimp`. Add `ACHIEVEMENT_META`, `ACHIEVEMENT_ORDER` from `./achievements`. Remove helpers `getLevelName`, `getXpProgress`. Remove export `showLevelUp` and `updateCharacterMood`. | Build passes; removed exports gone | R3.1, Phase R1, Phase R2 | cc:TODO |
| R3.4 | In `src/ui.ts` `renderDashboard`, replace XP bar section (xp-section div) with `<div class="condition-section"><div class="condition-bar-container"><div class="condition-bar" style="width: ${condition}%"></div></div><div class="condition-label">Posture ${condition}%</div></div>`. Remove `.level-label` element. After `app.innerHTML = ...`, find `#shrimp-character` and call `updateShrimp(el, state.progress.condition)`. Remove `const mood = ...`, `const stage = ...`, `const shrimpSvg = renderShrimp(stage, mood)` — now call `renderShrimp()` with no args. | Dashboard renders condition bar; no level/XP text anywhere | R3.3 | cc:TODO |
| R3.5 | In `src/ui.ts` `renderDashboard`, replace Total XP stat tile with Total completions: `<span class="stat-value" id="stat-total">${state.progress.totalCompletions}</span><span class="stat-label">Total</span>`. | Stats row shows Today / Streak / Total (=totalCompletions) | R3.4 | cc:TODO |
| R3.6 | In `src/ui.ts` `renderDashboard`, add achievements grid below stats: `<div class="achievements-grid">${ACHIEVEMENT_ORDER.map(id => { const meta = ACHIEVEMENT_META[id]; const unlockedAt = state.progress.achievements[id]; return unlockedAt ? `<div class="achievement-tile unlocked"><span class="ach-icon">${meta.icon}</span><span class="ach-name">${meta.name}</span><span class="ach-date">${unlockedAt}</span></div>` : `<div class="achievement-tile locked"><span class="ach-icon">🔒</span><span class="ach-name">${meta.name}</span></div>`; }).join('')}</div>`. | All 6 tiles render; locked vs unlocked visually distinct | R3.5 | cc:TODO |
| R3.7 | In `src/ui.ts` rewrite `updateStats(state)`: update `#stat-today`, `#stat-streak`, `#stat-total` (=totalCompletions), update condition bar width + label, re-render achievements grid (replace `.achievements-grid` innerHTML using same template as R3.6), then call `updateShrimp(document.getElementById('shrimp-character')!, state.progress.condition)`. Delete `updateCharacterMood` body (merged in). Remove XP/level update branches. | After each event, UI reflects new state smoothly | R3.6 | cc:TODO |
| R3.8 | In `src/ui.ts` `renderSettings`, update reset-confirm copy from `'Reset all progress? Your XP and level will be lost. This cannot be undone.'` to `'Reset all progress? Your condition, streak, and achievements will be lost. This cannot be undone.'`. | Copy matches new model | R3.3 | cc:TODO |
| R3.9 | In `src/ui.ts` `renderOnboarding`, update welcome body copy from `"I'll remind you to sit straight, stretch, and take breaks.<br>Help me evolve from a sad shrimp to a champion!"` to `"I'll remind you to sit straight, stretch, and take breaks.<br>Help me straighten up — your care shows in my posture!"`. Change `renderShrimp(1, 'happy')` call to `renderShrimp()` and after mount call `updateShrimp(el, 75)` to show happy state on onboarding. | Onboarding renders single-arg shrimp at happy posture | R3.3 | cc:TODO |
| R3.10 | In `src/style.css`, remove rules: `.xp-section`, `.xp-bar-container`, `.xp-bar`, `.xp-label`, `.level-label`, `.levelup-overlay`, `.levelup-content`, `.levelup-character`, `.levelup-title`, `.levelup-name`, `.levelup-message`, `@keyframes celebrate`, `.shrimp-character { animation: ... }`. | `grep -n "xp-\\|levelup\\|level-label\\|breathe-sad" src/style.css` returns nothing | R3.4 | cc:TODO |
| R3.11 | In `src/style.css`, add condition UI: `.condition-section { width: 100%; max-width: 320px; }`. `.condition-bar-container { width: 100%; height: 12px; background: var(--border); border-radius: 6px; overflow: hidden; }`. `.condition-bar { height: 100%; background: linear-gradient(90deg, #e74c3c 0%, #f1c40f 50%, #27ae60 100%); border-radius: 6px; transition: width 0.6s ease-out; }`. `.condition-label { margin-top: 6px; font-size: 0.85rem; color: var(--text-light); }`. | Bar visible; gradient red→yellow→green | R3.10 | cc:TODO |
| R3.12 | In `src/style.css`, add achievements grid: `.achievements-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%; max-width: 320px; }`. `.achievement-tile { display: flex; flex-direction: column; align-items: center; padding: 8px 4px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); font-size: 0.7rem; }`. `.achievement-tile.locked { opacity: 0.4; filter: grayscale(1); }`. `.ach-icon { font-size: 1.5rem; }`. `.ach-name { font-weight: 600; text-align: center; }`. `.ach-date { font-size: 0.65rem; color: var(--text-light); }`. | Grid displays 6 tiles in 3-col layout | R3.10 | cc:TODO |
| R3.13 | In `src/style.css`, add celebration overlay: `.achievement-overlay { position: fixed; inset: 0; pointer-events: none; display: flex; align-items: center; justify-content: center; z-index: 200; opacity: 0; transition: opacity 300ms ease; }`. `.achievement-overlay.visible { opacity: 1; pointer-events: auto; }`. `.achievement-card { background: var(--surface); border-radius: 16px; padding: 32px 40px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); text-align: center; animation: card-pop 600ms ease; }`. `@keyframes card-pop { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }`. `.confetti { position: absolute; left: 50%; top: 50%; width: 8px; height: 8px; border-radius: 2px; animation: confetti-fall 2.5s ease-out forwards; animation-delay: var(--delay); }`. `@keyframes confetti-fall { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(var(--x), 60vh) rotate(720deg); opacity: 0; } }`. | Overlay appears; confetti falls with randomized trajectories | R3.10 | cc:TODO |
| R3.14 | Commit Phase R3. Message: `✨ feat: condition bar, achievements grid, celebration overlay UI`. | git log shows commit | R3.1, R3.2, R3.3, R3.4, R3.5, R3.6, R3.7, R3.8, R3.9, R3.10, R3.11, R3.12, R3.13 | cc:TODO |

## Phase R4: App wiring

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| R4.1 | In `src/app.ts` update imports: drop `addXp`, `getXpForCompletion`. Add `recordCompletion`, `recordSnooze`. Drop `showLevelUp`, `updateCharacterMood` from `./ui`. Add `celebrate` from `./achievements`. Add `flashShrimp` from `./characters/shrimp`. | Build passes | Phase R1, Phase R3 | cc:TODO |
| R4.2 | In `src/app.ts`, add module variable `let hadSnooze = false`. In `handleReminder()` set `hadSnooze = false`. In `handleSnooze()` set `hadSnooze = true` before existing logic. `snoozeCount` tracking stays unchanged for MAX_SNOOZES limit. | Snooze → flag true; fresh reminder → flag false | R4.1 | cc:TODO |
| R4.3 | In `src/app.ts` rewrite `handleComplete()`: `stopTitleFlash()`; `const { state: next, unlocked } = recordCompletion(state, hadSnooze); state = next;` `escalation = deescalateOnComplete(escalation, state.settings.maxInterval);` `saveState(state); hideOverlay(); updateStats(state);` `const shrimpEl = document.getElementById('shrimp-character'); if (shrimpEl) flashShrimp(shrimpEl, 'bounce');` `if (unlocked.length > 0) celebrate(unlocked);` `hadSnooze = false; timer.scheduleNext();`. Delete level-up branch. | Complete raises condition; first-ever complete triggers firstStretch overlay; subsequent completes don't re-trigger | R4.2 | cc:TODO |
| R4.4 | In `src/app.ts` rewrite `handleDismiss()`: `stopTitleFlash(); state = recordIgnored(state); escalation = escalateOnIgnore(escalation, state.settings.minInterval); saveState(state); hideOverlay(); updateStats(state);` `const shrimpEl = document.getElementById('shrimp-character'); if (shrimpEl) flashShrimp(shrimpEl, 'deflate');` `hadSnooze = false; timer.scheduleNext();`. | Dismiss lowers condition by 4, clamps at 0, shrimp deflates | R4.2 | cc:TODO |
| R4.5 | In `src/app.ts` `handleSnooze()` call `state = recordSnooze(state)` (stays no-op); `saveState(state)` unchanged. Verify MAX_SNOOZES auto-dismiss branch still works. | Snooze no-ops condition; after 2 snoozes auto-dismiss fires correctly | R4.2 | cc:TODO |
| R4.6 | Update `CLAUDE.md` Conventions section: replace bullet `"XP only goes up — punishment is visual (sad shrimp) + escalation, never XP loss"` with `"Condition is bidirectional (0..100) — completions raise it, ignores lower it. Achievements are permanent ratchets that never un-unlock."`. Replace `"SVG characters are generated in code, not external assets"` (keep as-is). Update Architecture section: change `"src/characters/shrimp.ts — SVG shrimp renderer (5 stages × 3 moods)"` to `"src/characters/shrimp.ts — parametric SVG shrimp driven by condition scalar"`. Add line `"src/achievements.ts — achievement metadata + celebration queue"`. Change `"src/ui.ts — All DOM rendering (dashboard, overlay, settings, onboarding, level-up)"` to `"src/ui.ts — All DOM rendering (dashboard, overlay, settings, onboarding, achievements grid)"`. | CLAUDE.md matches new model | R4.3 | cc:TODO |
| R4.7 | Commit Phase R4. Message: `✨ feat: wire condition + achievements into app lifecycle`. | git log shows commit | R4.1, R4.2, R4.3, R4.4, R4.5, R4.6 | cc:TODO |

## Phase R5: Cleanup

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| R5.1 | Delete all PNG assets: `git rm public/characters/stage{1,2,3,4,5}-{happy,neutral,sad}.png` (15 files). | `ls public/characters/` empty or gone | Phase R2 | cc:TODO |
| R5.2 | Delete `git rm scripts/generate-shrimps.py`. If `scripts/` is empty, `git rm -r scripts/` (or leave). | File gone | R5.1 | cc:TODO |
| R5.3 | Delete `git rm docs/art-prompts.md`. | File gone | R5.1 | cc:TODO |
| R5.4 | Delete `git rm flux2_dev_workflow.json`. | File gone | R5.1 | cc:TODO |
| R5.5 | Commit Phase R5. Message: `🔥 chore: remove abandoned Flux/ComfyUI PNG art pipeline`. | Working tree clean for deleted files | R5.1, R5.2, R5.3, R5.4 | cc:TODO |

## Phase R6: Validation

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| R6.1 | Run `npm run build`. | Exit 0; `dist/` produced; zero TS errors | Phase R4, Phase R5 | cc:TODO |
| R6.2 | Dev server manual: start `npm run dev`, clear localStorage, complete onboarding → dashboard renders (shrimp at condition 50, neutral). Trigger reminder via DevTools `timer.snooze(0)` hack or wait for interval. Complete → condition bar grows; shrimp bounces + straightens; First Stretch overlay fires. Dismiss reminder → condition bar shrinks; shrimp deflates. Snooze then complete → condition +1 only. | All 4 event flows observed | R6.1 | cc:TODO |
| R6.3 | Achievement boundary check: seed each achievement precondition via DevTools `localStorage.setItem('shrimper-state', ...)` then reload, trigger one complete, confirm exact matching id in `unlocked` array (console.log) and overlay fires. Test all 6: firstStretch (fresh), threeInRow (totalCompletions=2, completionsInRow=2), streak7 (streak=6, lastCompletionDate=yesterday), streak30 (streak=29, lastCompletionDate=yesterday), total100 (totalCompletions=99), peakCondition (condition=97). | 6/6 fire exactly once at boundary | R6.2 | cc:TODO |
| R6.4 | Old-schema wipe: DevTools `localStorage.setItem('shrimper-state', '{"progress":{"xp":500,"level":3},"settings":{"minInterval":10,"maxInterval":20}}')`, reload. Confirm app lands on onboarding (isFirstRun true because key is now being set, so alternative: app loads with fresh v2 defaults and null isFirstRun). Acceptance: no XP/level appears, condition=50. | No crash; condition=50, achievements empty | R6.1 | cc:TODO |
| R6.5 | Visual posture sweep: in DevTools console set `document.querySelector('.shrimp').style.setProperty('--c', v)` with v=0, 0.25, 0.5, 0.75, 1. Confirm spine bends progressively; mouth cross-fades; color shifts cool-desat → warm-saturated. Confirm breathe + blink continue during transitions. | 5 visual states all correct and smooth | R6.1 | cc:TODO |
| R6.6 | Queue stress: seed `totalCompletions=99, streak=6, lastCompletionDate=yesterday` and trigger complete → expect both `total100` and `streak7` unlocked; two celebration overlays play sequentially with full card-pop + confetti each, no overlap. | Both overlays play back-to-back | R6.3 | cc:TODO |
| R6.7 | Final commit if any tweaks needed. Message: `✅ chore: validation pass complete`. | Working tree clean | R6.1..R6.6 | cc:TODO |
