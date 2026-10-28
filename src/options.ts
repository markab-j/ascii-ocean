import type { WaveDirection, WaveStyle } from "./waves";

export type GlyphMode = "ascii" | "hangul";
export type OceanTheme = "dark" | "light";

export interface NeonOptions {
  colors: string | string[];
  /** cycle changes over time; gradient follows each creature's body. */
  mode?: "cycle" | "gradient";
}

export interface OceanOptions {
  theme?: OceanTheme;
  /** Hangul uses syllables for surfaces and Korean jamo for every narrow detail. */
  glyphs?: GlyphMode;
  /** Disabled by default. Glow follows each creature's silhouette. */
  neon?: false | NeonOptions;
  waves?: {
    /** calm (default), rough, random wave shapes, or the original classic bands. */
    style?: WaveStyle;
    /** Degrees: 0 right, 90 down, 180 left, 270 up; random per new wave. */
    direction?: WaveDirection;
    /** Wave-agitated blue plankton light, independent of creature neon. */
    plankton?: boolean;
  };
}

const HANGUL = "가나다라물결바다빛파도한글";
const JAMO: Record<string, string> = {
  "-": "ㅡ", "|": "ㅣ", "/": "ㅅ", "\\": "ㄱ", "~": "ㄹ",
  ".": "ㅇ", ",": "ㄴ", "·": "ㅇ", ":": "ㅣ", ";": "ㅏ",
  "'": "ㅣ", "`": "ㄱ", "o": "ㅇ", "O": "ㅇ", "*": "ㅈ",
};

export function oceanGlyph(mode: GlyphMode, ascii: string, key: number, detail = false) {
  if (mode === "ascii") return ascii;
  return detail ? JAMO[ascii] ?? "ㄴㄱㅅㅣㅡ"[key % 5] : HANGUL[(key >>> 8) % HANGUL.length];
}
