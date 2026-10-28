import { angleDiff, clamp, current, rand, smoothstep, TAU } from "./math";
import type { WaveField, WaveSample } from "./waves";

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
  tilt: number;
  turn: number;
  initialized: boolean;
  tentacles: Float32Array[];
  tentaclePrev: Float32Array[];
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
    tilt: 0, turn: 0, initialized: false,
    tentacles: Array.from({ length: 16 }, () => new Float32Array(12)),
    tentaclePrev: Array.from({ length: 16 }, () => new Float32Array(12)),
  };
}

const water = { x: 0, y: 0 };
const wave: WaveSample = { crest: 0, flowX: 0, flowY: 0, lift: 0 };

export function stepJellyfish(j: Jellyfish, dt: number, time: number, width: number, height: number, waves: WaveField) {
  j.phase += dt * TAU / (2.7 + j.depth * 0.5);
  const before = j.contraction;
  j.contraction = bellContraction(j.phase);
  const thrust = Math.max(0, j.contraction - before) / dt;
  waves.sample(j.x, j.y, time, wave);
  current(j.x, j.y, time, water);
  const desired = Math.atan2(height / 2 - j.y, width / 2 - j.x);
  const edge = j.x < j.radius || j.x > width - j.radius || j.y < j.radius || j.y > height - j.radius;
  const steering = edge ? clamp(angleDiff(j.heading, desired), -0.3, 0.3) : Math.sin(time * 0.16 + j.id * 3) * 0.12;
  j.turn += (steering - j.turn) * Math.min(1, dt * 1.5);
  j.heading += j.turn * dt * (0.4 + j.contraction * 0.6);
  j.tilt += (wave.lift * 0.14 + j.turn * 0.25 - j.tilt) * Math.min(1, dt * 2);
  const hx = Math.cos(j.heading);
  const hy = Math.sin(j.heading);
  const margin = Math.min(j.radius * 1.5, width * 0.25, height * 0.25);
  let ax = hx * thrust * 21 + (water.x + wave.flowX) * 0.55;
  let ay = hy * thrust * 21 + (water.y + wave.flowY) * 0.55;
  if (j.x < margin) ax += (margin - j.x) * 0.7;
  if (j.x > width - margin) ax -= (j.x - width + margin) * 0.7;
  if (j.y < margin) ay += (margin - j.y) * 0.7;
  if (j.y > height - margin) ay -= (j.y - height + margin) * 0.7;
  j.vx = (j.vx + ax * dt) * Math.exp(-dt * 0.65);
  j.vy = (j.vy + ay * dt) * Math.exp(-dt * 0.65);
  j.x = clamp(j.x + j.vx * dt, -j.radius, width + j.radius);
  j.y = clamp(j.y + j.vy * dt, -j.radius, height + j.radius);

  const radius = j.radius * (1 - j.contraction * 0.18);
  const rotation = j.heading * 0.2;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  for (let k = 0; k < j.tentacles.length; k++) {
    const angle = k / j.tentacles.length * TAU;
    const nodes = j.tentacles[k];
    const previous = j.tentaclePrev[k];
    const localX = Math.cos(angle) * radius;
    const localY = Math.sin(angle) * radius * (0.82 + j.tilt);
    const rootX = j.x + localX * cos - localY * sin;
    const rootY = j.y + localX * sin + localY * cos;
    const segment = j.radius * (0.38 + 0.08 * Math.sin(k * 2.7)) / (nodes.length / 2 - 1);
    if (!j.initialized) {
      for (let n = 0; n < nodes.length / 2; n++) {
        nodes[n * 2] = previous[n * 2] = rootX + Math.cos(angle + rotation) * segment * n;
        nodes[n * 2 + 1] = previous[n * 2 + 1] = rootY + Math.sin(angle + rotation) * segment * n;
      }
    }
    nodes[0] = rootX;
    nodes[1] = rootY;
    for (let n = 2; n < nodes.length; n += 2) {
      waves.sample(nodes[n], nodes[n + 1], time, wave);
      const px = nodes[n];
      const py = nodes[n + 1];
      const dx = clamp((px - previous[n]) * Math.exp(-dt * 5), -segment, segment);
      const dy = clamp((py - previous[n + 1]) * Math.exp(-dt * 5), -segment, segment);
      const flutter = Math.sin(j.phase - n * 0.4 + angle) * 5;
      nodes[n] += dx + ((water.x + wave.flowX) * 1.8 - hx * thrust * 12 - hy * flutter) * dt * dt;
      nodes[n + 1] += dy + ((water.y + wave.flowY) * 1.8 - hy * thrust * 12 + hx * flutter) * dt * dt;
      previous[n] = px;
      previous[n + 1] = py;
    }
    // Inextensible, damped chains give the short fringe inertia and delayed recoil.
    for (let pass = 0; pass < 5; pass++) {
      nodes[0] = rootX;
      nodes[1] = rootY;
      for (let n = 2; n < nodes.length; n += 2) {
        const dx = nodes[n] - nodes[n - 2];
        const dy = nodes[n + 1] - nodes[n - 1];
        const length = Math.hypot(dx, dy) || 1;
        const error = (length - segment) / length;
        const share = n === 2 ? 1 : 0.5;
        nodes[n] -= dx * error * share;
        nodes[n + 1] -= dy * error * share;
        if (n > 2) {
          nodes[n - 2] += dx * error * 0.5;
          nodes[n - 1] += dy * error * 0.5;
        }
      }
    }
  }
  j.initialized = true;
}
