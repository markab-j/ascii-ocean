import type { WaveDirection } from "./waves";

export type GlyphMode = "ascii" | "hangul";

export interface NeonOptions {
  colors: string | string[];
  /** cycle changes over time; gradient follows each creature's body. */
  mode?: "cycle" | "gradient";
}

export interface OceanOptions {
  /** Hangul fills broad surfaces; narrow details keep their ASCII glyphs. */
  glyphs?: GlyphMode;
  /** Disabled by default. Glow follows each creature's silhouette. */
  neon?: false | NeonOptions;
  waves?: {
    /** Degrees: 0 right, 90 down, 180 left, 270 up; random per new wave. */
    direction?: WaveDirection;
  };
}

const HANGUL = "가나다라물결바다빛파도한글";

export function bodyGlyph(mode: GlyphMode, ascii: string, key: number) {
  return mode === "hangul" ? HANGUL[(key >>> 8) % HANGUL.length] : ascii;
}
