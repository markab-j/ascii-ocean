import { expect, test } from "bun:test";
import { planktonLight } from "../src/plankton";

test("afterglow decays by elapsed time rather than frame count", () => {
  const once = planktonLight(1, 0, 0, 0, 0, 1 / 30);
  const twice = planktonLight(planktonLight(1, 0, 0, 0, 0, 1 / 60), 0, 0, 0, 1 / 60, 1 / 60);
  expect(once).toBeCloseTo(twice);
  expect(once).toBeLessThan(1);
  expect(planktonLight(1, 0, 0, 0, 10, 10)).toBeLessThan(0.001);
});

test("crests activate varied but stable plankton patches", () => {
  const lights = Array.from({ length: 100 }, (_, i) => planktonLight(0, 1, i % 10, (i / 10) | 0, 1, 1 / 60));
  expect(lights.filter((v) => v > 0).length).toBeGreaterThan(10);
  expect(lights.filter((v) => v === 0).length).toBeGreaterThan(10);
  expect(lights.every((v) => v >= 0 && v <= 1)).toBe(true);
  expect(planktonLight(0, 0, 3, 5, 1, 1 / 60)).toBe(0);
});

test("modern swells glow with the crest instead of rapidly blinking at a fixed point", () => {
  const changes = Array.from({ length: 100 }, (_, i) => {
    const col = i % 10;
    const row = (i / 10) | 0;
    return Math.abs(planktonLight(0, 1, col, row, 2, 1 / 60) - planktonLight(0, 1, col, row, 2.1, 1 / 60));
  });
  expect(Math.max(...changes)).toBeLessThan(0.02);
  const energy = (crest: number) => Array.from({ length: 100 }, (_, i) =>
    planktonLight(0, crest, i % 10, (i / 10) | 0, 1, 1 / 60)).reduce((sum, value) => sum + value, 0);
  expect(energy(0.9)).toBeGreaterThan(energy(0.2) * 2);
});

test("classic keeps its short decay while modern swells have a softer wake", () => {
  const classic = planktonLight(1, 0, 0, 0, 1, 0.5, "classic");
  const calm = planktonLight(1, 0, 0, 0, 1, 0.5, "calm");
  expect(classic).toBeCloseTo(Math.exp(-0.5 * 3.8));
  expect(calm).toBeGreaterThan(classic);
  expect(calm).toBeLessThan(0.35);
});
