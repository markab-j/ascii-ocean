import { OceanEngine, isCreatureKind, type CreatureSpec, type GlyphMode } from "./src";

// ?sharks=thresher,hammerhead,mako,nurse — first is biggest, the rest step down. No param: four classics.
const params = new URLSearchParams(location.search);
const kinds = (params.get("creatures") ?? params.get("sharks"))?.split(",").filter(isCreatureKind);
const creatures: CreatureSpec[] | undefined = kinds?.map((kind, i) => ({ kind, size: Math.max(0.35, 1 - i * 0.1) }));

const engine = new OceanEngine(document.querySelector("canvas")!, creatures);
const roster = document.querySelector<HTMLSelectElement>("#creatures")!;
if (creatures) {
  const custom = new Option("URL 설정 · 사용자 지정", "custom");
  roster.add(custom);
  roster.value = "custom";
}
roster.addEventListener("change", () => {
  engine.setCreatures(roster.value === "custom" ? creatures : roster.value === "sharks" ? undefined : roster.value === "jellyfish"
    ? [{ kind: "jellyfish", size: 1 }, { kind: "jellyfish", size: 0.7 }, { kind: "jellyfish", size: 0.5 }]
    : [{ kind: "classic", size: 1 }, { kind: "hammerhead", size: 0.8 }, { kind: "jellyfish", size: 1 }, { kind: "jellyfish", size: 0.7 }]);
});
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
