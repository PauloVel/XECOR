# Huracán GT3 EVO2 – 3D showroom (v2: multi-zone livery)

## Use it on your website
Upload `index.html`, `app.js` and `lambo.glb` together (same folder) to any web host.
It must be served over http(s) — opening index.html from disk can't load the .glb (browser security).
Local test:  `python3 -m http.server`  then open http://localhost:8000
Embed:  `<iframe src="/lambo-site/index.html" style="border:0;width:100%;height:80vh"></iframe>`
(`lambo-standalone.html`, delivered separately, has everything inlined and opens by double-click.)

## Paint = 3 zones + carbon
The original livery was converted into a zone map (source/tex/zonemap.png): R = body, G = accent (stripes, wedges, splitter
lines, rear-fender slashes), B = secondary (hood patch, roof vents, nose wedges), black = carbon/trim. Sponsor logos removed.
Each colour scheme is two-tone and also recolours: rims (black), brake calipers, hood pins, roll cage + door shell, belts,
seat/dash suede stays black, displays + steering-wheel shift LEDs glow in the scheme's glow colour, cabin light follows revs.

## Customise (source/main.js -> `THEMES`, then `node build.mjs`)
{ base, accent, second, glow, trim, rim, caliper } — add or edit a line, a new swatch appears automatically.
Drivetrain feel: `GEAR_TOP`, `GEAR_ACC`.  Debug: `?v=250` locks speed (screenshots).

## Rebuild the model
`zones.py` (livery -> zone map; needs numpy/scipy/Pillow and tex/carpaint_base.png from `dumptex.mjs`) and
`optimize.mjs` (gltf-transform + meshoptimizer + sharp) turn your original download (save as `orig.glb`) into `lambo.glb`.

## LICENSE / CREDIT (required)
Model "2023 Lamborghini Huracán GT3 EVO2" by Dave Love — https://sketchfab.com/3d-models/2023-lamborghini-huracan-gt3-evo2-f8a58f112f544a4f96f2281e0f26eccd
CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ — attribution must stay visible (it is in the page footer).
Modified: livery recoloured/sponsors removed, wheels separated, geometry/textures optimized. Lamborghini and Huracán are
trademarks of their owner; this is an unofficial fan/portfolio showcase.

## Update: rainy night look + complete geometry
- Every part of the original is now present (interior carbon, inner windows, banner strip and grid panel as plain dark parts; only an invisible physics volume is dropped). The earlier loss came from the optimizer merging look-alike materials.
- Dark rainy scene: fog, dim dome, GPU rain streaks, wet floor with ripples, headlight beams, red tail glow, occasional faint lightning.
