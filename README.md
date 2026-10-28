# ALPINE 3L — promo films

Two versions of a promotional film for the same jacket, both rendered from this project:

| Version | Watch | Style |
| --- | --- | --- |
| **v2 · Launch** | [`alpine-3l-launch.mp4`](alpine-3l-launch.mp4) (48 s) | Tech product-launch keynote: dark stage, spotlit product, metallic display type, glass spec tiles, beat-synced cuts |
| v1 · Ascent | [`alpine-3l-ascent.mp4`](alpine-3l-ascent.mp4) (46 s) | Narrative climb: altimeter HUD, rain → gale → snow, whiteout end card |

Both are 1920×1080 promotional films for the ALPINE 3L hardshell hiking jacket, built with Remotion from the
product photos and spec sheet in [`vcproo/video-publicity`](https://github.com/vcproo/video-publicity) (clone it into `source/` to see the originals; the images the film uses are already copied into `film/public/img`).

## v2 · Launch

**Concept:** an original tech-launch keynote. The jacket is presented like flagship hardware on a dark stage: spotlight
cone and reflective floor, slowly drifting aurora light, metallic gradient display type, focus-pull transitions,
light sweeps across numbers and media, a fine-line HUD frame, and a glass "bento" spec grid. Every cut lands on a bar
line of an original 120 BPM electronic score.

| Time | Chapter | Content |
| --- | --- | --- |
| 0:00 | Prologue | A horizon line of light, "风暴，只是测试环境。", the silhouette rising out of the dark |
| 0:06 | Introducing | Beat drop: spotlit product on a glossy floor under a metallic ALPINE 3L wordmark |
| 0:10 | Architecture | Glowing exploded layers rotating in 3D, fusing into "3 → 1" and 185 g/㎡ |
| 0:16 | Performance | Full-screen count-ups: ≥20,000 mm H₂O, then ≥15,000 g/㎡·24h |
| 0:22 | Details | Eight on-the-beat feature shots in tilted 3D frames with light sweeps |
| 0:34 | Specifications | Glass bento grid of the key figures |
| 0:40 | Finale | Turntable on an orbit ring, colourway and fit; end card "把风暴，挡在外面。" |

## v1 · Ascent

**Concept:** the film is a climb. An altimeter HUD and route profile run throughout, the weather gets harsher with altitude
(rain → gale → snow), and each feature is a camp on the way up. At the summit, the snow builds into a whiteout that
resolves into the light-background hero shot.

| Time | Scene | Content |
| --- | --- | --- |
| 0:00 | Storm | Forecast teleprinter, lightning glimpse of the jacket, "天气，才是真正的考场。" |
| 0:05 | Title | ALPINE 3L over the droplet macro, contour lines drawing in |
| 0:09 | Anatomy | 3D exploded view of the shell / PU membrane / 20D knit, then collapse to 185 g/㎡ and the material mix |
| 0:16 | Barrier | Rain stops at the membrane while vapour passes through: ≥20,000 mm (a 20 m water column), ≥15,000 g/㎡·24h |
| 0:23 | Camps 1–4 | Stormproofing, abrasion armour, adjusters, pockets |
| 0:35 | Summit | Front/back turntable, 620 g, colourway, tags |
| 0:41 | Whiteout → end card | "风雨在外，你在山上。" plus use cases and the standard target |

In both versions, all figures come from `source/说明.md`. The abrasion figure (≥20,000 cycles) and GB/T 32614-2023 Class I are labelled as
targets, as the spec sheet states. The altitude, temperature and route are fictional storytelling devices. The chest-pocket photo
(`11_胸前拉链口袋.png`) is not used because a phone brand logo is visible in it.

## Layout

```
alpine-3l-ascent.mp4 final film (1920×1080, 30 fps, AAC audio)
source/              cloned asset repo (not committed)
film/
  src/Root.tsx       registers both compositions: AlpineAscent (v1) and AlpineLaunch (v2)
  src/theme.ts       fonts, v1 palette and timing table (fonts are shared with v2)
  src/fx.tsx         v1: procedural weather, whiteout, contour lines, altimeter HUD, grain
  src/scenes.tsx     v1: the seven scenes
  src/Film.tsx       v1: sequencing and audio mix
  src/launch/kit.tsx      v2: stage lighting, aurora, metallic type, sweeps, reflections, HUD frame
  src/launch/scenes.tsx   v2: the eight chapters
  src/launch/Launch.tsx   v2: sequencing and audio mix
  tools/make-audio.sh         v1 score stems (rain, wind, drone, thump, bell)
  tools/make-launch-audio.py  v2 score stems (120 BPM kick, hats, bass, arp, pad, risers)
  public/img         product photos converted to JPG (+ an alpha PNG of the membrane)
  public/audio       generated score stems (not committed; created by tools/make-audio.sh)
  public/sfx         transition SFX reused from video-shotcraft-intro
  render.sh          resumable chunked render + audio pass + mux
  render.mjs         renders one chunk via @remotion/renderer (avoids a CLI progress-bar crash in 4.0.484)
  qa.mjs             renders half-size stills: `COMP=AlpineLaunch node qa.mjs 60 330 1100`
```

## Run

Requires Node 22, FFmpeg 7 and a Chrome headless shell (`$CHS`). On the author's machine these come from `~/.local/opt/env.sh`. Elsewhere, run `npm ci` in `film/` and set `CHS` to a chrome-headless-shell binary.

```bash
. ~/.local/opt/env.sh
cd film
./tools/make-audio.sh && python3 tools/make-launch-audio.py   # generate both scores (first run)
npx remotion studio src/index.ts        # preview either composition
COMP=AlpineLaunch ./render.sh           # v2 → out/alpine-3l-launch.mp4
./render.sh                             # v1 → out/alpine-3l-ascent.mp4
# finished chunks in out/chunks/<COMP> are skipped; clear that folder to re-render
```

Each render uses concurrency 2 in three chunks, so it stays well within 8 GB of RAM.

## Known issues

- Rendering sometimes logs `delayRender() "Loading fonts" ... timed out` while the system Noto Sans CJK font loads.
  Remotion retries those frames automatically and they come out correctly; it only adds render time.
