# ALPINE 3L — promo films

Four versions of a promotional film for the same jacket, plus two voiceover cuts, all rendered from this project:

| Version | Watch | Style |
| --- | --- | --- |
| **Opening v2 + v4** | [`alpine-3l-interface-with-opening-v2.mp4`](alpine-3l-interface-with-opening-v2.mp4) (58 s) | Voiceover cut, new photo presentation: a stepping 3D carousel that collapses into the core |
| Opening + v4 | [`alpine-3l-interface-with-opening.mp4`](alpine-3l-interface-with-opening.mp4) (58 s) | A 10 s text-free opening for the voiceover, then v4 · Interface |
| **v4 · Interface** | [`alpine-3l-interface.mp4`](alpine-3l-interface.mp4) (48 s) | v3 wrapped in a live HUD/FUI: boot-up chrome, radar, telemetry, event log, reticle lock-ons, and animated information layers per chapter |
| v3 · Genesis | [`alpine-3l-genesis.mp4`](alpine-3l-genesis.mp4) (48 s) | Futuristic motion: particle-built product and numbers, holographic X-ray scan, glitch cuts, warp-speed reel, 3D spec orbit, implosion finale |
| v2 · Launch | [`alpine-3l-launch.mp4`](alpine-3l-launch.mp4) (48 s) | Tech product-launch keynote: dark stage, spotlit product, metallic display type, glass spec tiles, beat-synced cuts |
| v1 · Ascent | [`alpine-3l-ascent.mp4`](alpine-3l-ascent.mp4) (46 s) | Narrative climb: altimeter HUD, rain → gale → snow, whiteout end card |

All are 1920×1080 promotional films for the ALPINE 3L hardshell hiking jacket, built with Remotion from the
product photos and spec sheet in [`vcproo/video-publicity`](https://github.com/vcproo/video-publicity) (clone it into `source/` to see the originals; the images the film uses are already copied into `film/public/img`).

## Opening + v4 (voiceover cut)

A 10-second animated opening with no on-screen text, made to sit under this voiceover, followed by v4:

> "Can you create a promotional video using just a few photos of a garment? I shared my idea with Claude, and this is the video it produced."

| Time | Voiceover | Picture |
| --- | --- | --- |
| 0–3.5 s | "…using just a few photos of a garment?" | Six of the source product photos land one by one, as prints, on a dark surface |
| 3.5–6.5 s | "I shared my idea with Claude," | The prints lift off and stream, trailing particles, into a core of light that brightens with each one |
| 6.5–10 s | "and this is the video it produced." | The core unfolds into a screen showing the jacket; the camera pushes through it into the black v4 opens on |

**Opening v2** (`src/opening/OpeningV2.tsx`, composition `AlpineOpeningV2`) keeps the same beats and the same
6.5–10 s ending, but presents the photos differently. Six large photo panels stand on a 3D carousel with glass
edges and floor reflections. On each beat the carousel snaps a turn, and the next photo tears open from a slit
of light, with a flash, a zoom punch and a shutter click. It then spins up, motion-blurs and collapses into the core
as a particle vortex.

The music bed (`tools/make-opening-audio.py`) is kept soft for the voice and is in Bb, the chord the v4 score starts on.
It ends in a riser that lands on v4's first frame. No voiceover is recorded into the file: lay the recording over
0:00–0:10. The opening deliberately avoids the Claude logo; "Claude" is suggested by the core of light.

## v4 · Interface

**Concept:** the Genesis film seen through the jacket's own operating interface. The picture underneath is v3,
unchanged. On top sit two new layers:

- **FUI chrome** (`src/fui/chrome.tsx`): it boots on, drawing in corner brackets, scrolling tick rulers and side
  rails, and shuts down at the end ("SESSION END"). It carries:
  - an ident panel with the chapter name, timecode and a beat-synced level meter
  - spec telemetry
  - a radar sweep with blips
  - a system log whose entries are pinned to the on-screen events
  - a hex data stream
  - a chapter timeline
  - a reticle that glides between points of interest and re-locks
- **Information layers** (`src/fui/layers.tsx`), one per chapter:
  - an assembly progress ring with a particle count
  - target-acquired brackets
  - a scan-depth ruler riding the X-ray bar, and a separation ring around the layer slabs
  - hydrostatic-head and MVTR charts climbing to the spec thresholds
  - a zone mini-map with a metadata panel for each feature
  - a donut of the 65/12/23 mass mix
  - "ALL SYSTEMS NOMINAL", turning into an amber "CORE COLLAPSE" hazard frame before the implosion

Every number in the interface is from the spec sheet. The chart traces are illustrative curves that climb to the
published thresholds, not test data. UI sound cues are layered on top of the v3 score.

## v3 · Genesis

**Concept:** the product is built in front of you. Thousands of canvas particles, sampled from the product photo
and from rendered type, swirl in as a galaxy and get "printed" into the jacket by a laser scanline. The same particles
later form the big numbers and the final logo. Motion vocabulary: decoding text, RGB-split and band-slice glitch cuts,
a perspective grid floor, tracking callouts locked to points on the jacket, a holographic scan, warp-speed streaks
between z-axis fly-in panels, and a 3D orbit of spec tags. The original score adds a sub drop, a reese bass,
telemetry blips and glitch stutters.

| Time | Chapter | Content |
| --- | --- | --- |
| 0:00 | Genesis | Particle galaxy → laser-printed particle jacket → solid product |
| 0:06 | Reveal | Glitch drop, decoded wordmark, grid floor, four tracking callouts |
| 0:10 | X-ray | Holographic scan with a live layer readout, then a dive into the fabric: glowing 3D layer slabs, "3 → 1" |
| 0:16 | Performance | ≥20,000 assembles from falling rain, ≥15,000 from rising vapour |
| 0:22 | Details | Eight features flying in through warp streaks |
| 0:34 | Specifications | Spec tags orbiting the jacket |
| 0:40 | Finale | Colourway; the jacket implodes into a singularity; a shockwave, then the logo assembles from particles |

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

In every version, all figures come from `source/说明.md`. The abrasion figure (≥20,000 cycles) and GB/T 32614-2023 Class I are labelled as
targets, as the spec sheet states. The altitude, temperature and route are fictional storytelling devices. The chest-pocket photo
(`11_胸前拉链口袋.png`) is not used because a phone brand logo is visible in it.

## Layout

```
alpine-3l-ascent.mp4 final film (1920×1080, 30 fps, AAC audio)
source/              cloned asset repo (not committed)
film/
  src/Root.tsx       registers all compositions: AlpineAscent (v1), AlpineLaunch (v2), AlpineGenesis (v3), AlpineInterface (v4), AlpineOpening, AlpineOpeningV2
  src/theme.ts       fonts, v1 palette and timing table (fonts are shared by all versions)
  src/fx.tsx         v1: procedural weather, whiteout, contour lines, altimeter HUD, grain
  src/scenes.tsx     v1: the seven scenes
  src/Film.tsx       v1: sequencing and audio mix
  src/launch/kit.tsx      v2: stage lighting, aurora, metallic type, sweeps, reflections, HUD frame (also used by v3)
  src/launch/scenes.tsx   v2: the eight chapters
  src/launch/Launch.tsx   v2: sequencing and audio mix
  src/genesis/engine.tsx  v3: particle sampling + canvas, decode text, RGB-split/slice glitch, warp, grid floor, scanlines
  src/genesis/scenes.tsx  v3: the seven chapters
  src/genesis/Genesis.tsx v3: sequencing and audio mix (its chapter and audio tables are reused by v4)
  src/fui/chrome.tsx      v4: persistent HUD/FUI chrome
  src/fui/layers.tsx      v4: per-chapter information layers
  src/fui/Interface.tsx   v4: v3 picture + layers + chrome, v3 score + UI cues
  src/opening/Opening.tsx 10 s text-free opening for the voiceover (v1: prints on a table)
  src/opening/OpeningV2.tsx opening v2: stepping 3D carousel → vortex
  tools/make-opening-audio.py opening music bed (pad, plucks, chimes, swell, riser)
  tools/assemble-opening.sh   joins an opening + out/alpine-3l-interface.mp4 (OPENING=v2 for opening v2)
  tools/make-audio.sh         v1 score stems (rain, wind, drone, thump, bell)
  tools/make-launch-audio.py  v2 score stems (120 BPM kick, hats, bass, arp, pad, risers)
  tools/make-genesis-audio.py v3 score stems (sub drops, reese bass, arp, blips, pad, glitch FX)
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
./tools/make-audio.sh && python3 tools/make-launch-audio.py && python3 tools/make-genesis-audio.py && python3 tools/make-opening-audio.py   # all scores (first run)
npx remotion studio src/index.ts        # preview either composition
COMP=AlpineOpening FINAL_CRF=20 ./render.sh     # opening → out/alpine-3l-opening.mp4
./tools/assemble-opening.sh                     # opening + v4 → out/alpine-3l-interface-with-opening.mp4
COMP=AlpineOpeningV2 FINAL_CRF=20 ./render.sh   # opening v2 → out/alpine-3l-opening-v2.mp4
OPENING=v2 ./tools/assemble-opening.sh          # opening v2 + v4 → out/alpine-3l-interface-with-opening-v2.mp4
COMP=AlpineInterface FINAL_CRF=20 ./render.sh   # v4 → out/alpine-3l-interface.mp4
COMP=AlpineGenesis FINAL_CRF=20 ./render.sh     # v3 → out/alpine-3l-genesis.mp4
COMP=AlpineLaunch ./render.sh           # v2 → out/alpine-3l-launch.mp4
./render.sh                             # v1 → out/alpine-3l-ascent.mp4
# finished chunks in out/chunks/<COMP> are skipped; clear that folder to re-render
```

Each render uses concurrency 2 in three chunks, so it stays well within 8 GB of RAM.

## Known issues

- Rendering sometimes logs `delayRender() "Loading fonts" ... timed out` while the system Noto Sans CJK font loads.
  Remotion retries those frames automatically and they come out correctly; it only adds render time.
