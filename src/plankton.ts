import { clamp, hash3, TAU } from "./math";

/** Stable patches flash as a crest passes, with a short, frame-rate independent afterglow. */
export function planktonLight(previous: number, crest: number, col: number, row: number, time: number, dt: number) {
  const density = hash3(Math.floor(col / 7), Math.floor(row / 5), 91);
  const cell = hash3(col, row, 43);
  const threshold = 0.35 + density * 0.28;
  const sparkle = 0.6 + 0.4 * Math.sin(time * (5 + cell * 5) + cell * TAU);
  const excitation = cell > threshold ? crest * (0.4 + cell * 0.6) * sparkle : 0;
  return clamp(Math.max(previous * Math.exp(-Math.max(0, dt) * 3.8), excitation), 0, 1);
}
