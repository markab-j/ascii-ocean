import { TAU } from "./math";

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

  resize(width: number, height: number, time: number) {
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    this.reset(time);
  }

  private reset(time: number) {
    this.bands = [];
    const count = Math.ceil((Math.hypot(this.width, this.height) + 240) / (SPEED * INTERVAL));
    for (let n = count; n >= 0; n--) this.spawn(time - n * INTERVAL);
    this.next = time + INTERVAL;
  }

  private spawn(born: number) {
    const angle = Math.PI / 2;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    this.bands.push({ id: this.serial++, born, dx, dy, span: (Math.abs(dx) * this.width + Math.abs(dy) * this.height) / 2 + 100 });
  }

  advance(time: number) {
    while (time >= this.next) {
      this.spawn(this.next);
      this.next += INTERVAL;
    }
    this.bands = this.bands.filter((band) => (time - band.born) * SPEED < band.span * 2 + 140);
  }

  sample(x: number, y: number, time: number, out: WaveSample) {
    out.crest = out.flowX = out.flowY = out.lift = 0;
    const px = x - this.width / 2;
    const py = y - this.height / 2;
    for (const band of this.bands) {
      const cross = -px * band.dy + py * band.dx;
      const bend = Math.sin(cross / 180 + band.id * 1.7) * 20 + Math.sin(cross / 73 - time * 0.12) * 6;
      const center = -band.span + (time - band.born) * SPEED;
      const distance = px * band.dx + py * band.dy - center + bend;
      if (Math.abs(distance) > 180) continue;
      const envelope = Math.exp(-((distance / 66) ** 2));
      const crest = Math.exp(-((distance / (22 + Math.sin(cross / 130 + band.id) * 4)) ** 2));
      out.crest = Math.max(out.crest, crest);
      const flow = Math.cos(distance / 70 * TAU * 0.2) * envelope * 8;
      out.flowX += band.dx * flow;
      out.flowY += band.dy * flow;
      out.lift += Math.sin(distance / 65) * envelope;
    }
    return out;
  }
}
