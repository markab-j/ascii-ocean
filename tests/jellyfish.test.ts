import { expect, test } from "bun:test";
import { bellContraction } from "../src/jellyfish";
import { TAU } from "../src/math";
import { World } from "../src/world";

test("bell contraction has continuous cyclic endpoints and an asymmetric pulse", () => {
  expect(bellContraction(0)).toBeCloseTo(0);
  expect(bellContraction(TAU * 0.3)).toBeCloseTo(1);
  expect(bellContraction(TAU)).toBeCloseTo(0);
  expect(bellContraction(-0.001)).toBeCloseTo(bellContraction(TAU - 0.001));
  for (let phase = 0; phase < TAU * 2; phase += 0.1) {
    expect(bellContraction(phase)).toBeGreaterThanOrEqual(0);
    expect(bellContraction(phase)).toBeLessThanOrEqual(1);
  }
});

test("jellyfish share the roster without acquiring shark hunting behaviour", () => {
  const world = new World([{ kind: "jellyfish", size: 1 }, { kind: "mako", size: 0.8 }], 12);
  world.resize(800, 600, 10, 15);
  expect(world.sharks.map((s) => s.kind)).toEqual(["mako"]);
  expect(world.jellyfish).toHaveLength(1);
  for (let i = 0; i < 600; i++) world.step(1 / 60);
  const j = world.jellyfish[0];
  expect([j.x, j.y, j.vx, j.vy, ...j.tentacles.flatMap((nodes) => [...nodes])].every(Number.isFinite)).toBe(true);
  expect(j.x).toBeGreaterThan(-j.radius);
  expect(j.x).toBeLessThan(800 + j.radius);
  expect(() => world.setCreatures([{ kind: "classic", size: -1 }])).toThrow();
  expect(world.jellyfish).toHaveLength(1);
});

test("tentacle constraints remain bounded during sustained swimming and resize", () => {
  const world = new World([{ kind: "jellyfish", size: 0.8 }], 0);
  world.resize(640, 480, 10, 15);
  for (let i = 0; i < 1800; i++) world.step(1 / 60);
  world.resize(320, 480, 10, 15);
  for (let i = 0; i < 600; i++) world.step(1 / 60);
  const j = world.jellyfish[0];
  for (let k = 0; k < j.tentacles.length; k++) {
    const nodes = j.tentacles[k];
    const segment = j.radius * (0.38 + 0.08 * Math.sin(k * 2.7)) / (nodes.length / 2 - 1);
    for (let n = 2; n < nodes.length; n += 2) {
      expect(Math.hypot(nodes[n] - nodes[n - 2], nodes[n + 1] - nodes[n - 1])).toBeLessThan(segment * 1.15);
    }
  }
  expect(Number.isFinite(j.tilt)).toBe(true);
});
