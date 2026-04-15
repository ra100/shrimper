# Shrimper Character Art Prompts

Style direction for all stages. Use these with Midjourney, DALL-E, Stable Diffusion, or similar.

## Global Style Prompt (prepend to each)

```
Cute cartoon shrimp character, modern indie game illustration style, clean vector-like lines, soft muted warm color palette (peach, coral, salmon tones), simple expressive face, white/transparent background, centered composition, no text, suitable for web app avatar at 512x512px
```

## Stage 1 — Sad Shrimp (Level 1)

**Happy mood:**
```
A tiny cartoon shrimp curled into a tight C-shape, fully hunched over like someone with terrible posture, segmented curved body with visible shell ridges, small tail fan tucked in, thin dangling legs, two long droopy antennae, small round eyes on short stalks with a gentle hopeful smile, soft peach/salmon colors, the shrimp looks small and round but friendly, idle breathing pose, modern indie game character art, clean lines, transparent background
```

**Sad mood:**
```
A tiny cartoon shrimp curled into a tight C-shape, fully hunched over, segmented curved body, small tail fan tucked in, thin dangling legs, two long very droopy antennae pointing down, half-closed sleepy eyes on short stalks with a small frown, desaturated muted pinkish-gray colors, the shrimp looks tired and defeated but still cute, modern indie game character art, clean lines, transparent background
```

## Stage 2 — Waking Shrimp (Level 2)

**Happy mood:**
```
A small cartoon shrimp slightly uncurling from a C-shape, body less hunched than before, one eye slightly bigger and more alert than the other as if just waking up, segmented curved body with visible shell ridges, small tail fan starting to spread, thin legs trying to stand, two antennae slightly raised, warm peach-coral colors slightly brighter than stage 1, the shrimp looks curious and waking up, tiny legs visible underneath, modern indie game character art, clean lines, transparent background
```

**Sad mood:**
```
A small cartoon shrimp slightly uncurling from C-shape, one eye half-open the other droopy, segmented body, small tail fan, thin legs dangling, antennae slightly droopy, desaturated warm tones, looks like it tried to wake up but gave up, still cute, modern indie game character art, clean lines, transparent background
```

## Stage 3 — Trying Shrimp (Level 3)

**Happy mood:**
```
A cartoon shrimp halfway between curled and upright, body forming a gentle curve instead of tight C, visibly trying to stand straighter with a wobbly hopeful expression, segmented body with clear shell ridges, tail fan spreading out, small legs planted on ground, two antennae perked up, small arm-like appendages raised enthusiastically, warm coral-peach colors getting brighter, eyes are round and determined with a big hopeful smile, the shrimp looks like it is trying really hard, modern indie game character art, clean lines, transparent background
```

**Sad mood:**
```
A cartoon shrimp halfway uncurled, trying to stand but slouching, wobbly posture, segmented body, tail fan half-spread, legs planted but knees bent, antennae drooping sideways, small frown, desaturated coral tones, looks like it tried to stand straight but is losing motivation, still endearing, modern indie game character art, clean lines, transparent background
```

## Stage 4 — Strong Shrimp (Level 4)

**Happy mood:**
```
A cartoon shrimp standing mostly upright with confident posture, body almost straight with just a slight natural curve, segmented body with pronounced shell ridges, tail fan fully spread and proud, strong legs firmly planted, two long antennae pointing upward alertly, arm-like appendages in a confident pose, warm golden-coral colors vibrant and saturated, big round eyes with bright highlights and a confident wide smile, the shrimp looks strong and self-assured, modern indie game character art, clean lines, transparent background
```

**Sad mood:**
```
A cartoon shrimp standing mostly upright but shoulders slumped, body slightly drooping from its usually confident pose, segmented body, tail fan half-lowered, legs still firm but posture defeated, antennae drooping forward, small sad eyes with a slight frown, muted golden-tan colors, looks like a strong shrimp having a bad day, still dignified, modern indie game character art, clean lines, transparent background
```

## Stage 5 — Champion Shrimp (Level 5)

**Happy mood:**
```
A cartoon shrimp standing fully upright and proud like a superhero, body tall and straight with perfect posture, segmented body with bold shell ridges, magnificent tail fan fully spread like a peacock, strong legs in a power stance, two majestic long antennae reaching upward, arm-like appendages flexing like a bodybuilder, wearing a small golden crown with colorful jewels on top of head, subtle golden glow/sparkles around the crown, warm golden-amber colors rich and vibrant, large expressive eyes with big highlights and a triumphant beaming smile, the shrimp radiates confidence and achievement, modern indie game character art, clean lines, transparent background
```

**Sad mood:**
```
A cartoon shrimp standing upright but visibly deflated, wearing a slightly tilted golden crown, body tall but slouched, tail fan lowered, arms hanging at sides instead of flexing, antennae drooping forward, crown slightly askew, small sad eyes and downturned mouth, desaturated golden-gray tones, looks like a king who is disappointed in you but still loves you, still majestic even when sad, modern indie game character art, clean lines, transparent background
```

## Neutral Mood Modifier

For any stage, to generate the neutral mood variant, take the happy prompt and add:
```
, with a neutral flat expression, mouth is a simple straight line, eyes are slightly narrowed but not sad, colors slightly less saturated than happy version but more vibrant than sad version
```

## Asset Specs

- **Format:** PNG with transparent background
- **Size:** 512×512px (will be displayed at 160-180px in app)
- **Variants needed per stage:** 3 (happy, neutral, sad)
- **Total assets:** 15 images (5 stages × 3 moods)
- **Color progression:** Stage 1 (muted peach) → Stage 5 (vibrant golden-amber)
- **Posture progression:** Stage 1 (tight C-curl) → Stage 5 (fully upright hero pose)

## Midjourney-Specific Tips

Add these suffixes for best results:
```
--style raw --ar 1:1 --s 250 --no realistic photo photography 3d render
```

## Integration Notes

To use generated images instead of SVGs, replace `renderShrimp()` in `src/characters/shrimp.ts` to return `<img>` tags pointing to the assets. Place PNGs in `public/characters/` with naming convention:
```
public/characters/
  stage1-happy.png
  stage1-neutral.png
  stage1-sad.png
  stage2-happy.png
  ...
  stage5-sad.png
```
