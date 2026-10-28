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
