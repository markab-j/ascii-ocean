import { clamp, hash3, TAU } from "./math";
import type { WaveStyle } from "./waves";

/** Stable patches flash as a crest passes, with a short, frame-rate independent afterglow. */
export function planktonLight(previous: number, crest: number, col: number, row: number, time: number, dt: number, style: WaveStyle = "calm") {
  const cell = hash3(col, row, 43);
  if (style === "classic") {
    const density = hash3(Math.floor(col / 7), Math.floor(row / 5), 91);
    const threshold = 0.35 + density * 0.28;
    const sparkle = 0.6 + 0.4 * Math.sin(time * (5 + cell * 5) + cell * TAU);
    const excitation = cell > threshold ? crest * (0.4 + cell * 0.6) * sparkle : 0;
    return clamp(Math.max(previous * Math.exp(-Math.max(0, dt) * 3.8), excitation), 0, 1);
  }
  // Continuous patches replace the old coarse blocks and fast firefly-like twinkle.
  const patch = 0.5 + Math.sin(col * 0.19 + Math.sin(row * 0.23) * 1.4) * 0.28
    + Math.sin(row * 0.31 - col * 0.075) * 0.22;
  const glimmer = 0.92 + Math.sin(time * 1.4 + cell * TAU) * 0.08;
  const excitation = cell > 0.3 + patch * 0.26
    ? Math.pow(Math.max(0, crest), 0.85) * (0.4 + cell * 0.6) * (0.6 + patch * 0.4) * glimmer
    : 0;
  return clamp(Math.max(previous * Math.exp(-Math.max(0, dt) * 2.6), excitation), 0, 1);
}
