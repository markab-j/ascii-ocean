import { OceanEngine, type GlyphMode, type SharkKind, type SharkSpec } from "./src";

// ?sharks=thresher,hammerhead,mako,nurse — first is biggest, the rest step down. No param: four classics.
const kinds = new URLSearchParams(location.search).get("sharks")?.split(",").filter(Boolean) as SharkKind[] | undefined;
const sharks: SharkSpec[] | undefined = kinds?.map((kind, i) => ({ kind, size: 1 - i * 0.1 }));

const engine = new OceanEngine(document.querySelector("canvas")!, sharks);
const glyphs = document.querySelector<HTMLSelectElement>("#glyphs")!;
const neon = document.querySelector<HTMLInputElement>("#neon")!;
const colors = document.querySelector<HTMLInputElement>("#neon-colors")!;
const neonMode = document.querySelector<HTMLSelectElement>("#neon-mode")!;
const status = document.querySelector<HTMLElement>("#settings-status")!;
function updateAppearance() {
  try {
    engine.setOptions({
      glyphs: glyphs.value as GlyphMode,
      neon: neon.checked ? { colors: colors.value.split(",").map((c) => c.trim()), mode: neonMode.value as "cycle" | "gradient" } : false,
    });
    status.textContent = "";
    colors.setAttribute("aria-invalid", "false");
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "설정을 확인해 주세요.";
    colors.setAttribute("aria-invalid", "true");
  }
}
glyphs.addEventListener("change", updateAppearance);
neon.addEventListener("change", updateAppearance);
colors.addEventListener("input", updateAppearance);
neonMode.addEventListener("change", updateAppearance);
window.addEventListener("pagehide", () => engine.destroy());
