# Agent Development Guide

Rules for any agent (human or AI) shipping changes to Shrimper. See `CLAUDE.md` for architecture context.

## Release discipline

Every user-facing change ships with:

1. **Version bump** in `package.json` following [SemVer](https://semver.org/):
   - `patch` — bug fixes, copy tweaks, no behavior change for users
   - `minor` — new features, new UI, new gameplay hooks
   - `major` — breaking storage schema, reset-required migrations
2. **CHANGELOG.md entry** under `## [Unreleased]`, following [Keep a Changelog](https://keepachangelog.com/). Move `Unreleased` → version on release.
3. **Commit** with gitmoji matching the change type.

Skip version bump only for: pure refactors with no user impact, internal docs, tooling-only changes.

## CHANGELOG sections

Use these headings under each version:

- `Added` — new features
- `Changed` — behavior changes
- `Fixed` — bug fixes
- `Removed` — dropped features
- `Internal` — dev-only changes worth noting

## Commit style

- Gitmoji prefix: ✨ feat, 🐛 fix, 📝 docs, 🎨 refactor, ⚡ perf, 🔧 config, 🔖 release
- Subject ≤72 chars, imperative mood
- Body explains **why**, not **what** (diff shows what)

## Preflight checklist

Before marking work complete:

```bash
pnpm check       # Biome lint + format (writes)
pnpm build       # Type-check + prod build must pass
pnpm knip        # No new dead code / unused deps
```

Fix or justify every warning before committing.

## Release flow

```bash
# 1. Bump version in package.json
# 2. Update CHANGELOG.md: move Unreleased items under new version + date
# 3. Commit with 🔖 emoji
git commit -m "🔖 release: v0.2.0"
# 4. Tag + push
git tag v0.2.0
git push --follow-tags
```

## Feature work conventions

See `CLAUDE.md` for architecture, tech stack, and gameplay invariants — don't fight them.

- Keep modules single-purpose
- All state mutations go through `state.ts` helpers
- New persistent fields need a schema migration (bump `SCHEMA_VERSION` + map old → new in `loadState`)

## UI conventions

- Version number visible in settings footer → clicking opens CHANGELOG modal
- First load after version bump: auto-show changelog modal once
- All interactive elements keyboard-navigable
