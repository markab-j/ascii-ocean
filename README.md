# ascii ocean

```
                            ;'
                             %%'
                              .t;.               .oooo
                               S;:S%              %8S8.
                                ;:tt%t '..        XX%%S
t'                            ''XSSS8SSX%XX8#.    %XSX%
 :;'               ;.''X8%8XX%%S%%S%SStt%tSX8S#X8't%ttt.
  ::%'       ''8XXXSSt%Stttttt%8@%%@%8@8%Sttt%%%%SSSSS%tt.
  'SXXtt%t%%%S%:;StS%ttSS%tSXSt88@@%8%@8%tStS%%X%SS%%S%;;t
 .@##88#@...'@@@@#@8@88X88#XXXSX8SX88SX8%SS%S%%S88St%t%%%.
  %;%t             :.    '.'##@###@X#888XX##8@@@#.X%XS%.
 .%t                            ;%%%#@@##@@@.     SXS%%
 t.                            .%;%%%.            %%XXS
                              '%t:t              .SXSS'
                             '::.                ooooo
                            .S'
                            .
```

Fish and sharks drawn as ASCII on a canvas. Zero dependencies.

Inspired by [ascii-sharks](https://github.com/stackedlol/ascii-sharks). This project began from a clone of that repository and is being customized as `ascii-ocean`.

Requires Bun 1.4.4 (pinned in `.tool-versions`).

```sh
bun install
bun run dev
```

```ts
import { OceanEngine } from "./src";

const engine = new OceanEngine(canvas, [{ kind: "hammerhead", size: 1 }]);

// Appearance can change without restarting the simulation.
engine.setOptions({ theme: "light" }); // "dark" (default) or "light"
engine.setOptions({ glyphs: "hangul" }); // "ascii" (default) or "hangul"
engine.setOptions({ neon: { colors: "#65dfff" } }); // #RGB or #RRGGBB
engine.setOptions({ neon: false }); // off by default
engine.setOptions({ neon: { colors: ["#65dfff", "#b581ff", "#ff83bf"], mode: "gradient" } });
// mode: "cycle" (default) smoothly loops through the colours over time.
```

The demo's control panel switches between ASCII and Hangul. Hangul mode uses **only Korean characters** throughout the canvas: syllables for broad surfaces and jamo such as `ㅡ`, `ㅣ`, `ㄴ`, `ㄱ`, `ㅇ` for fins, edges, fish, tentacles, and particles. Shark glyph colours stay steady; colour cycling belongs to the optional neon layer.

The panel uses the canvas's monospace style and square borders. Switch light/dark themes with its theme button, pick neon colours using the swatches (`[+]` / `[-]` adds or removes a colour), and drag the 0–360° wave slider. Dragging selects a manual angle, including when leaving random mode. Controls retain accessible names without repeated visible labels.

Mix sharks and moon jellyfish in the same roster:

```ts
const engine = new OceanEngine(canvas, [
  { kind: "hammerhead", size: 1 },
  { kind: "jellyfish", size: 0.8 },
]);
```

The demo supports `?creatures=jellyfish,hammerhead` and the original `?sharks=...` URL. `engine.setCreatures([...])` changes the roster and reseeds the ecosystem.

Moon jellyfish use asymmetric bell pulses, coasting, gradual turns, and damped short tentacles that respond to currents and shared surface waves. Passing waves carry the whole animal with a gently delayed drift, separately from its own swimming; a change in flow eases into the new direction. This is a lightweight visual simulation, informed by [research on moon-jellyfish swimming](https://pmc.ncbi.nlm.nih.gov/articles/PMC7980403/).

```ts
engine.setOptions({ waves: { direction: 135 } });
engine.setOptions({ waves: { direction: "random" } });
```

Angles are in degrees: 0 right, 90 down, 180 left, 270 up. Random direction is selected once per new wave; a wave keeps its direction while travelling.

```ts
engine.setOptions({ waves: { direction: "random", plankton: true } });
engine.setOptions({ waves: { style: "rough" } });
engine.setOptions({ waves: { plankton: false } });
```

Blue bioluminescent plankton flash in patches as the crests pass, with a short afterglow inspired by *Noctiluca scintillans*. The plankton and creature-neon switches are independent and off by default.

Choose the wave shape in the panel or with `waves.style`: `"calm"` (default) has slower, softer swells, `"rough"` has faster, stronger breaking fronts, and `"random"` varies each swell's speed, spacing, curvature, and strength. `"classic"` keeps the original narrow wave bands. Shape and direction are independent: random shapes can still travel in a fixed direction.

Passing crests also cast a soft blue reflection on sharks, jellyfish, and tiny fish, while keeping their glyphs legible. Jellyfish motion and the light sample the same wave field. The effect is inspired by [flow-stimulated dinoflagellate bioluminescence](https://latzlab.ucsd.edu/bioluminescence/dinoflagellates/dinoflagellate-bioluminescence/).

Complete configuration:

```ts
const engine = new OceanEngine(canvas, [
  { kind: "hammerhead", size: 1 },
  { kind: "jellyfish", size: 0.8 },
], {
  glyphs: "hangul",
  neon: { colors: ["#65dfff", "#b581ff"], mode: "gradient" },
  waves: { direction: "random", plankton: true },
});
```

The optional React adapter is available from `./src/react`:

```tsx
<AsciiOcean
  creatures={[{ kind: "jellyfish", size: 1 }]}
  options={{ glyphs: "hangul", waves: { direction: 135, plankton: true } }}
/>
```

The original `sharks` prop remains supported. Live `options` updates preserve the simulation; changing `creatures` reseeds it. Call `engine.destroy()` when removing a canvas. Off-screen canvases pause, and `prefers-reduced-motion` displays a still scene.

```sh
bun test
bun run typecheck
bun run build
```

MIT
