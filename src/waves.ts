import { clamp, hash3, smoothstep, TAU } from "./math";

export type WaveDirection = number | "random";
export type WaveStyle = "classic" | "calm" | "rough" | "random";

export function validateWaveStyle(style: WaveStyle) {
  if (!["classic", "calm", "rough", "random"].includes(style)) {
    throw new Error('Wave style must be "classic", "calm", "rough", or "random"');
  }
}

export function normalizeDirection(direction: WaveDirection): WaveDirection {
  if (direction === "random") return direction;
  if (typeof direction !== "number" || !Number.isFinite(direction)) {
    throw new Error('Wave direction must be a finite angle or "random"');
  }
  return ((direction % 360) + 360) % 360;
}

export interface WaveSample {
  crest: number;
  flowX: number;
  flowY: number;
  lift: number;
}

interface WaveBand {
  id: number;
  born: number;
  dx: number;
  dy: number;
  span: number;
  speed: number;
  interval: number;
  width: number;
  strength: number;
  bend: number;
  scale: number;
  flow: number;
  reach: number;
  classic: boolean;
  roughness: number;
}

const SPEED = 42;
const INTERVAL = 7.5;

/** Shared surface motion: the animals and light sample the same moving crests. */
export class WaveField {
  private width = 0;
  private height = 0;
  private bands: WaveBand[] = [];
  private next = 0;
  private serial = 0;
  private direction: WaveDirection = 90;
  private style: WaveStyle = "calm";

  setStyle(style: WaveStyle, time: number) {
    validateWaveStyle(style);
    if (style === this.style) return;
    this.style = style;
    if (this.width > 0 && this.height > 0) this.reset(time);
  }

  setDirection(direction: WaveDirection, time: number) {
    const next = normalizeDirection(direction);
    if (next === this.direction) return;
    this.direction = next;
    if (this.width > 0 && this.height > 0) this.reset(time);
  }

  resize(width: number, height: number, time: number) {
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    this.reset(time);
  }

  private reset(time: number) {
    this.bands = [];
    if (this.style === "classic") {
      const count = Math.ceil((Math.hypot(this.width, this.height) + 240) / (SPEED * INTERVAL));
      for (let n = count; n >= 0; n--) this.spawn(time - n * INTERVAL);
      this.next = time + INTERVAL;
    } else {
      // Seed older swells so a newly selected style already fills the viewport.
      const maxAge = (Math.hypot(this.width, this.height) + 900) / 20;
      let born = time;
      while (time - born < maxAge) {
        const band = this.spawn(born);
        if (born === time) this.next = time + band.interval;
        born -= band.interval;
      }
    }
    this.prune(time);
  }

  private spawn(born: number) {
    const id = this.serial++;
    const classic = this.style === "classic";
    // Sample variation once per swell, never once per frame.
    const roughness = this.style === "random" ? Math.random() : this.style === "rough" ? 1 : 0;
    const variation = hash3(id, 23, 71) - 0.5;
    const speed = classic ? SPEED : (28 + roughness * 36) * (1 + variation * 0.2);
    const interval = classic ? INTERVAL : (12 - roughness * 5.5) * (1 + variation * 0.25);
    const width = classic ? 22 : (42 + roughness * 20) * (1 + variation * 0.2);
    const strength = classic ? 1 : 0.42 + roughness * 0.5;
    const bend = 24 + roughness * 48;
    const reach = classic ? 180 : width * 3 + bend;
    const angle = this.direction === "random" ? Math.random() * TAU : this.direction * Math.PI / 180;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const band: WaveBand = {
      id, born, dx, dy, speed, interval, width, strength, bend, reach, classic, roughness,
      scale: 240 - roughness * 110,
      flow: 3.2 + roughness * 5.8,
      span: (Math.abs(dx) * this.width + Math.abs(dy) * this.height) / 2 + (classic ? 100 : reach),
    };
    this.bands.push(band);
    return band;
  }

  advance(time: number) {
    while (time >= this.next) {
      const band = this.spawn(this.next);
      this.next += band.interval;
    }
    this.prune(time);
  }

  private prune(time: number) {
    this.bands = this.bands.filter((band) => (time - band.born) * band.speed < band.span * 2 + (band.classic ? 140 : band.reach));
  }

  sample(x: number, y: number, time: number, out: WaveSample) {
    out.crest = out.flowX = out.flowY = out.lift = 0;
    const px = x - this.width / 2;
    const py = y - this.height / 2;
    for (const band of this.bands) {
      const cross = -px * band.dy + py * band.dx;
      const center = -band.span + (time - band.born) * band.speed;
      // Skip distant swells before evaluating their curved fronts.
      const along = px * band.dx + py * band.dy - center;
      if (Math.abs(along) > band.reach + band.bend * 1.3 + band.width * 1.5) continue;
      if (band.classic) {
        const bend = Math.sin(cross / 180 + band.id * 1.7) * 20 + Math.sin(cross / 73 - time * 0.12) * 6;
        const distance = along + bend;
        if (Math.abs(distance) > 180) continue;
        const envelope = Math.exp(-((distance / 66) ** 2));
        const crest = Math.exp(-((distance / (22 + Math.sin(cross / 130 + band.id) * 4)) ** 2));
        out.crest = Math.max(out.crest, crest);
        const flow = Math.cos(distance / 70 * TAU * 0.2) * envelope * 8;
        out.flowX += band.dx * flow;
        out.flowY += band.dy * flow;
        out.lift += Math.sin(distance / 65) * envelope;
        continue;
      }

      const phase = band.id * 2.399;
      // Finite wave groups leave quiet water between crests instead of spanning the screen.
      const halfWidth = 260 - band.roughness * 135;
      const spacing = halfWidth * 2.65;
      const offset = hash3(band.id, 19, 37) * spacing;
      const packet = Math.floor((cross + offset) / spacing);
      const local = cross + offset - (packet + 0.5) * spacing;
      const seed = hash3(packet, band.id, 83);
      const extent = halfWidth * (0.75 + seed * 0.35);
      const q = Math.abs(local) / extent;
      const packetEnvelope = 1 - smoothstep(0.55, 1, q);
      const curl = Math.min(q, 1) ** 2 * band.width * (0.65 + band.roughness * 0.6);
      const bend = Math.sin(cross / band.scale + phase) * band.bend
        + Math.sin(cross / (band.scale * 0.43) - time * 0.14 + phase * 0.6) * band.bend * 0.24
        + curl * packetEnvelope;
      const distance = px * band.dx + py * band.dy - center + bend;
      if (Math.abs(distance) > band.reach) continue;
      // A steep advancing face rolls into a broad fading back, rather than a light bar.
      const faceWidth = band.width * (distance > 0 ? 0.48 : 1.65);
      const face = Math.exp(-((distance / faceWidth) ** 2));
      const breaks = smoothstep(-0.6, 0.7, Math.sin(cross / (band.scale * 0.7) + phase)
        + Math.sin(cross / (band.scale * 0.29) - time * 0.2 + phase) * 0.35);
      const shoulder = Math.exp(-(((distance + band.width * 1.25) / (band.width * 0.8)) ** 2)) * 0.16;
      const crest = clamp((face * (0.52 + breaks * 0.48) + shoulder) * band.strength * packetEnvelope * (0.65 + seed * 0.35), 0, 1);
      out.crest = Math.max(out.crest, crest);
      const envelope = Math.exp(-((distance / (band.width * 2.1)) ** 2));
      const flow = Math.cos(distance / (band.width * 1.8)) * envelope * band.flow;
      out.flowX += band.dx * flow;
      out.flowY += band.dy * flow;
      out.lift += Math.sin(distance / (band.width * 1.6)) * envelope * band.strength;
    }
    return out;
  }
}
