import { expect, test } from "bun:test";
import { normalizeDirection, WaveField, type WaveSample, type WaveStyle } from "../src/waves";

const empty = (): WaveSample => ({ crest: 0, flowX: 0, flowY: 0, lift: 0 });

test("directions wrap and reject invalid runtime input", () => {
  expect(normalizeDirection(-90)).toBe(270);
  expect(normalizeDirection(450)).toBe(90);
  expect(normalizeDirection("random")).toBe("random");
  expect(() => normalizeDirection(NaN)).toThrow();
  expect(() => normalizeDirection(Infinity)).toThrow();
});

test("wave flow follows the selected axis and stays continuous", () => {
  const waves = new WaveField();
  waves.resize(640, 480, 0);
  for (const direction of [0, 90, 180, 270]) {
    waves.setDirection(direction, 0);
    let totalX = 0;
    let totalY = 0;
    let bounded = true;
    for (let y = 0; y < 480; y += 20) {
      for (let x = 0; x < 640; x += 20) {
        const sample = waves.sample(x, y, 0, empty());
        totalX += Math.abs(sample.flowX);
        totalY += Math.abs(sample.flowY);
        bounded &&= sample.crest >= 0 && sample.crest <= 1;
      }
    }
    expect(bounded).toBe(true);
    expect(direction % 180 === 0 ? totalX : totalY).toBeGreaterThan(1);
    expect(direction % 180 === 0 ? totalY : totalX).toBeLessThan(1e-8);
  }
  const a = waves.sample(300, 200, 1, empty());
  const b = waves.sample(300, 200, 1.001, empty());
  expect(Math.abs(a.crest - b.crest)).toBeLessThan(0.01);
});

test("random wave sampling is stable, and reapplying a direction preserves the field", () => {
  const waves = new WaveField();
  waves.resize(800, 600, 0);
  waves.setDirection("random", 0);
  const sample = waves.sample(400, 300, 0, empty());
  expect(waves.sample(400, 300, 0, empty())).toEqual(sample);
  waves.setDirection("random", 0);
  expect(waves.sample(400, 300, 0, empty())).toEqual(sample);
  for (let t = 0; t < 180; t += 0.5) waves.advance(t);
  expect(Object.values(waves.sample(400, 300, 180, empty())).every(Number.isFinite)).toBe(true);
});

test("calm and rough swells have visibly different propagation and intensity", () => {
  const measure = (style: WaveStyle) => {
    const waves = new WaveField();
    waves.setStyle(style, 0);
    waves.resize(1200, 800, 0);
    const peak = (time: number, low: number, high: number) => {
      let best = { y: low, height: 0 };
      const out = empty();
      for (let y = low; y <= high; y++) {
        const height = waves.sample(600, y, time, out).crest;
        if (height > best.height) best = { y, height };
      }
      return best;
    };
    const first = peak(0, 100, 650);
    const second = peak(1, first.y - 10, first.y + 100);
    return { speed: second.y - first.y, intensity: first.height };
  };
  const classic = measure("classic");
  const calm = measure("calm");
  const rough = measure("rough");
  expect(classic.speed).toBeGreaterThanOrEqual(40);
  expect(classic.speed).toBeLessThanOrEqual(44);
  expect(classic.intensity).toBeGreaterThan(0.95);
  expect(calm.speed).toBeLessThan(classic.speed);
  expect(rough.speed).toBeGreaterThan(classic.speed);
  expect(rough.intensity).toBeGreaterThan(calm.intensity * 1.5);
});

test("wave styles are stable when reapplied and reject invalid input atomically", () => {
  const waves = new WaveField();
  waves.resize(800, 600, 0);
  for (const style of ["classic", "calm", "rough", "random"] as const) {
    waves.setStyle(style, 0);
    const first = waves.sample(400, 300, 0, empty());
    waves.setStyle(style, 0);
    expect(waves.sample(400, 300, 0, empty())).toEqual(first);
    expect(() => waves.setStyle("invalid" as WaveStyle, 0)).toThrow();
    expect(waves.sample(400, 300, 0, empty())).toEqual(first);
    for (let time = 0; time < 90; time += 0.5) waves.advance(time);
    const sample = waves.sample(400, 300, 90, empty());
    expect(Object.values(sample).every(Number.isFinite)).toBe(true);
    expect(sample.crest >= 0 && sample.crest <= 1).toBe(true);
  }
});
