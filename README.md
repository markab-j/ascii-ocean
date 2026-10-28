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
engine.setOptions({ glyphs: "hangul" }); // "ascii" (default) or "hangul"
```

The demo's control panel also switches between ASCII and Hangul. Narrow fins, edges, and tiny fish keep ASCII details so the silhouette stays readable.

MIT
