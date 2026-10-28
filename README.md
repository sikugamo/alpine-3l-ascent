# ALPINE 3L — "Ascent" promo film

**▶ Watch: [`alpine-3l-ascent.mp4`](alpine-3l-ascent.mp4)**

A 46-second, 1920×1080 promotional film for the ALPINE 3L hardshell hiking jacket, built with Remotion from the
product photos and spec sheet in [`vcproo/video-publicity`](https://github.com/vcproo/video-publicity) (clone it into `source/` to see the originals; the images the film uses are already copied into `film/public/img`).

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

All figures come from `source/说明.md`. The abrasion figure (≥20,000 cycles) and GB/T 32614-2023 Class I are labelled as
targets, as the spec sheet states. The altitude, temperature and route are fictional storytelling devices. The chest-pocket photo
(`11_胸前拉链口袋.png`) is not used because a phone brand logo is visible in it.

## Layout

```
alpine-3l-ascent.mp4 final film (1920×1080, 30 fps, AAC audio)
source/              cloned asset repo (not committed)
film/
  src/theme.ts       palette, fonts, scene timing table
  src/fx.tsx         procedural weather, whiteout, contour lines, altimeter HUD, grain
  src/scenes.tsx     the seven scenes
  src/Film.tsx       sequencing and audio mix
  tools/make-audio.sh  synthesizes the original score stems (rain, wind, drone, thump, bell) with FFmpeg
  public/img         product photos converted to JPG (+ an alpha PNG of the membrane)
  public/audio       generated score stems (not committed; created by tools/make-audio.sh)
  public/sfx         transition SFX reused from video-shotcraft-intro
  render.sh          resumable chunked render + audio pass + mux
  render.mjs         renders one chunk via @remotion/renderer (avoids a CLI progress-bar crash in 4.0.484)
  qa.mjs             renders half-size stills: `node qa.mjs 60 330 1100`
```

## Run

Requires Node 22, FFmpeg 7 and a Chrome headless shell (`$CHS`). On the author's machine these come from `~/.local/opt/env.sh`. Elsewhere, run `npm ci` in `film/` and set `CHS` to a chrome-headless-shell binary.

```bash
. ~/.local/opt/env.sh
cd film
./tools/make-audio.sh     # generate the score stems (first run)
npx remotion studio src/index.ts   # preview
./render.sh               # final render → out/alpine-3l-ascent.mp4 (finished chunks are skipped; clear out/chunks to re-render)
```

Rendering uses concurrency 2 in three chunks, so it stays well within 8 GB of RAM.

## Known issues

- Rendering sometimes logs `delayRender() "Loading fonts" ... timed out` while the system Noto Sans CJK font loads.
  Remotion retries those frames automatically and they come out correctly; it only adds render time.
