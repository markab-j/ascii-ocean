import { OceanEngine, type GlyphMode, type SharkKind, type SharkSpec } from "./src";

// ?sharks=thresher,hammerhead,mako,nurse — first is biggest, the rest step down. No param: four classics.
const kinds = new URLSearchParams(location.search).get("sharks")?.split(",").filter(Boolean) as SharkKind[] | undefined;
const sharks: SharkSpec[] | undefined = kinds?.map((kind, i) => ({ kind, size: 1 - i * 0.1 }));

const engine = new OceanEngine(document.querySelector("canvas")!, sharks);
const glyphs = document.querySelector<HTMLSelectElement>("#glyphs")!;
glyphs.addEventListener("change", () => engine.setOptions({ glyphs: glyphs.value as GlyphMode }));
window.addEventListener("pagehide", () => engine.destroy());
