import { OceanEngine, isCreatureKind, type CreatureSpec, type GlyphMode, type WaveStyle } from "./src";

// ?sharks=thresher,hammerhead,mako,nurse — first is biggest, the rest step down. No param: four classics.
const params = new URLSearchParams(location.search);
const kinds = (params.get("creatures") ?? params.get("sharks"))?.split(",").filter(isCreatureKind);
const creatures: CreatureSpec[] | undefined = kinds?.map((kind, i) => ({ kind, size: Math.max(0.35, 1 - i * 0.1) }));

const engine = new OceanEngine(document.querySelector("canvas")!, creatures);
const theme = document.querySelector<HTMLButtonElement>("#theme")!;
theme.addEventListener("click", () => {
  const light = document.documentElement.dataset.theme !== "light";
  engine.setOptions({ theme: light ? "light" : "dark" });
  document.documentElement.dataset.theme = light ? "light" : "dark";
  theme.textContent = light ? "[ dark ]" : "[ light ]";
  theme.setAttribute("aria-label", light ? "다크 모드로 전환" : "라이트 모드로 전환");
  theme.setAttribute("aria-pressed", String(light));
});
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
const colors = document.querySelector<HTMLElement>("#neon-colors")!;
const addColor = document.querySelector<HTMLButtonElement>("#add-color")!;
const removeColor = document.querySelector<HTMLButtonElement>("#remove-color")!;
const palette = ["#65dfff"];
const neonMode = document.querySelector<HTMLSelectElement>("#neon-mode")!;
const waveDirection = document.querySelector<HTMLSelectElement>("#wave-direction")!;
const waveStyle = document.querySelector<HTMLSelectElement>("#wave-style")!;
const waveAngle = document.querySelector<HTMLInputElement>("#wave-angle")!;
const angleValue = document.querySelector<HTMLOutputElement>("#wave-angle-value")!;
const plankton = document.querySelector<HTMLInputElement>("#plankton")!;
const status = document.querySelector<HTMLElement>("#settings-status")!;
function updateAppearance() {
  try {
    engine.setOptions({
      glyphs: glyphs.value as GlyphMode,
      neon: neon.checked ? { colors: [...palette], mode: neonMode.value as "cycle" | "gradient" } : false,
      waves: {
        style: waveStyle.value as WaveStyle,
        direction: waveDirection.value === "random" ? "random" : waveDirection.value === "custom" ? waveAngle.valueAsNumber : Number(waveDirection.value),
        plankton: plankton.checked,
      },
    });
    status.textContent = "";
    angleValue.value = waveDirection.value === "random" ? "rnd" : `${waveAngle.value}°`;
    waveAngle.setAttribute("aria-valuetext", `${waveAngle.value}도`);
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "설정을 확인해 주세요.";
  }
}

function renderPalette() {
  colors.replaceChildren(...palette.map((color, i) => {
    const picker = document.createElement("input");
    picker.type = "color";
    picker.value = color;
    picker.title = color;
    picker.setAttribute("aria-label", `네온 색상 ${i + 1}`);
    picker.addEventListener("input", () => {
      palette[i] = picker.value;
      picker.title = picker.value;
      updateAppearance();
    });
    return picker;
  }));
  removeColor.disabled = palette.length === 1;
}
renderPalette();
addColor.addEventListener("click", () => {
  palette.push(["#65dfff", "#b581ff", "#ff83bf"][palette.length % 3]);
  renderPalette();
  updateAppearance();
});
removeColor.addEventListener("click", () => {
  if (palette.length <= 1) return;
  palette.pop();
  renderPalette();
  updateAppearance();
});
glyphs.addEventListener("change", updateAppearance);
neon.addEventListener("change", updateAppearance);
neonMode.addEventListener("change", updateAppearance);
waveStyle.addEventListener("change", updateAppearance);
waveDirection.addEventListener("change", () => {
  if (waveDirection.value !== "custom" && waveDirection.value !== "random") waveAngle.value = waveDirection.value;
  updateAppearance();
});
waveAngle.addEventListener("input", () => {
  waveDirection.value = "custom";
  updateAppearance();
});
plankton.addEventListener("change", updateAppearance);
window.addEventListener("pagehide", () => engine.destroy());
