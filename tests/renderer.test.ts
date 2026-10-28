import { expect, test } from "bun:test";
import { AsciiRenderer } from "../src/renderer";
import { World } from "../src/world";

/** Capture actual drawing calls without introducing a browser or canvas dependency. */
function drawingFixture() {
  const text: string[] = [];
  const fills: string[] = [];
  const colors: string[] = [];
  const makeCanvas = () => {
    const context = new Proxy({
      fillStyle: "",
      fillText(value: string) { text.push(value); colors.push(this.fillStyle); },
      fillRect() { fills.push(this.fillStyle); },
      measureText() { return { width: 14 }; },
    }, { get(target, name) { return Reflect.get(target, name) ?? (() => {}); } });
    return { width: 0, height: 0, getContext: () => context } as unknown as HTMLCanvasElement;
  };
  return { text, fills, colors, makeCanvas };
}

test("Hangul mode emits only Korean syllables or jamo across the complete renderer", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "document");
  const fixture = drawingFixture();
  Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: fixture.makeCanvas } });
  try {
    const renderer = new AsciiRenderer(fixture.makeCanvas(), { glyphs: "hangul", waves: { plankton: true } });
    renderer.resize(800, 600, 1);
    const world = new World([{ kind: "classic", size: 1 }, { kind: "jellyfish", size: 1 }], 24);
    world.resize(800, 600, renderer.cellWidth, renderer.cellHeight);
    world.events.push({ kind: "eat", x: 400, y: 300 });
    renderer.render(world, 1 / 60);
    expect(fixture.text.length).toBeGreaterThan(20);
    expect(fixture.text.every((glyph) => /^[\u3131-\u318e\uac00-\ud7a3]$/u.test(glyph))).toBe(true);

    fixture.text.length = 0;
    renderer.setOptions({ glyphs: "ascii" });
    renderer.resize(800, 600, 1);
    renderer.render(world, 1 / 60);
    expect(fixture.text.some((glyph) => /^[\x20-\x7e]$/.test(glyph))).toBe(true);

    renderer.setOptions({ theme: "light" });
    expect(fixture.fills).toContain("#f1f5f4");
    renderer.setOptions({ theme: "dark" });
    expect(fixture.fills.at(-1)).toBe("#000");
  } finally {
    if (original) Object.defineProperty(globalThis, "document", original);
    else Reflect.deleteProperty(globalThis, "document");
  }
});

test("stationary shark glyphs keep their colours as time advances", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "document");
  const fixture = drawingFixture();
  Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: fixture.makeCanvas } });
  try {
    const renderer = new AsciiRenderer(fixture.makeCanvas());
    renderer.resize(800, 600, 1);
    const world = new World([{ kind: "classic", size: 1 }], 0);
    world.resize(800, 600, renderer.cellWidth, renderer.cellHeight);
    renderer.render(world, 1 / 60);
    const first = [...fixture.colors];
    expect(first.length).toBeGreaterThan(20);
    fixture.colors.length = 0;
    world.time = 10;
    renderer.render(world, 1 / 60);
    expect(fixture.colors).toEqual(first);
  } finally {
    if (original) Object.defineProperty(globalThis, "document", original);
    else Reflect.deleteProperty(globalThis, "document");
  }
});
