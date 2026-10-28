import { expect, test } from "bun:test";
import { paletteColor, parseColors, parseHex } from "../src/lighting";

test("HEX input accepts shorthand and case-insensitive full colours", () => {
  expect(parseHex("#0cf")).toEqual([0, 204, 255]);
  expect(parseHex("#Aa10FF")).toEqual([170, 16, 255]);
});

test("palettes validate all colours, including empty lists", () => {
  expect(parseColors(["#000", "#fff"])).toEqual([[0, 0, 0], [255, 255, 255]]);
  expect(() => parseColors([])).toThrow();
  expect(() => parseColors(["#fff", "bad"])).toThrow();
});

test("gradients reach their endpoints and cycles join without a colour jump", () => {
  const colors = parseColors(["#000", "#fff"]);
  expect(paletteColor(colors, 0)).toEqual([0, 0, 0]);
  expect(paletteColor(colors, 0.5)).toEqual([128, 128, 128]);
  expect(paletteColor(colors, 1)).toEqual([255, 255, 255]);
  expect(paletteColor(colors, 0.99999, true)).toEqual(paletteColor(colors, 0.00001, true));
  expect(paletteColor(parseColors("#0cf"), 100, true)).toEqual([0, 204, 255]);
});

test("invalid colours cannot silently become black or CSS expressions", () => {
  for (const value of ["red", "", "#12", "#12345g", "#12345678", "rgb(0,0,0)"]) {
    expect(() => parseHex(value)).toThrow();
  }
});
