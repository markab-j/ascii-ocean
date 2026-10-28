export type RGB = [number, number, number];

/** Only explicit HEX colours are accepted, keeping API and demo inputs identical. */
export function parseHex(value: string): RGB {
  if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) {
    throw new Error("Use a HEX colour such as #0cf or #66ddff");
  }
  const hex = value.slice(1);
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
  return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16)) as RGB;
}
