import { clamp, rand, smoothstep, TAU } from "./math";

export interface Jellyfish {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  depth: number;
  heading: number;
  phase: number;
  contraction: number;
  tentacles: Float32Array[];
}

/** A quick squeeze followed by a longer elastic refill. */
export function bellContraction(phase: number) {
  const p = ((phase / TAU) % 1 + 1) % 1;
  return p < 0.3 ? smoothstep(0, 0.3, p) : 1 - smoothstep(0.3, 1, p);
}

export function createJellyfish(id: number, x: number, y: number, radius: number, depth: number): Jellyfish {
  const phase = rand(0, TAU);
  return {
    id, x, y, radius, depth, vx: 0, vy: 0,
    heading: rand(-Math.PI, Math.PI), phase, contraction: bellContraction(phase),
    tentacles: Array.from({ length: 16 }, () => new Float32Array(12)),
  };
}

export function stepJellyfish(j: Jellyfish, dt: number, time: number, width: number, height: number) {
  j.phase += dt * TAU / (2.7 + j.depth * 0.5);
  const before = j.contraction;
  j.contraction = bellContraction(j.phase);
  const thrust = Math.max(0, j.contraction - before) / dt;
  j.heading += Math.sin(time * 0.16 + j.id * 3) * dt * 0.12;
  const hx = Math.cos(j.heading);
  const hy = Math.sin(j.heading);
  const margin = Math.min(j.radius * 1.5, width * 0.25, height * 0.25);
  let ax = hx * thrust * 21;
  let ay = hy * thrust * 21;
  if (j.x < margin) ax += (margin - j.x) * 0.7;
  if (j.x > width - margin) ax -= (j.x - width + margin) * 0.7;
  if (j.y < margin) ay += (margin - j.y) * 0.7;
  if (j.y > height - margin) ay -= (j.y - height + margin) * 0.7;
  j.vx = (j.vx + ax * dt) * Math.exp(-dt * 0.65);
  j.vy = (j.vy + ay * dt) * Math.exp(-dt * 0.65);
  j.x = clamp(j.x + j.vx * dt, -j.radius, width + j.radius);
  j.y = clamp(j.y + j.vy * dt, -j.radius, height + j.radius);

  const radius = j.radius * (1 - j.contraction * 0.18);
  for (let k = 0; k < j.tentacles.length; k++) {
    const angle = k / j.tentacles.length * TAU;
    const nodes = j.tentacles[k];
    for (let n = 0; n < nodes.length / 2; n++) {
      const s = n / (nodes.length / 2 - 1);
      const r = radius * (1 + s * 0.32);
      const wave = Math.sin(j.phase - s * 3 + angle) * s * j.radius * 0.025;
      nodes[n * 2] = j.x + Math.cos(angle) * r - hx * s * j.radius * 0.22 - hy * wave;
      nodes[n * 2 + 1] = j.y + Math.sin(angle) * r * 0.82 - hy * s * j.radius * 0.22 + hx * wave;
    }
  }
}
