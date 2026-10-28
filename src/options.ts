export type GlyphMode = "ascii" | "hangul";

export interface OceanOptions {
  /** Hangul fills broad surfaces; narrow details keep their ASCII glyphs. */
  glyphs?: GlyphMode;
}

const HANGUL = "가나다라물결바다빛파도한글";

export function bodyGlyph(mode: GlyphMode, ascii: string, key: number) {
  return mode === "hangul" ? HANGUL[(key >>> 8) % HANGUL.length] : ascii;
}
