import { expect, test } from "bun:test";
import { parseHex } from "../src/lighting";

test("HEX input accepts shorthand and case-insensitive full colours", () => {
  expect(parseHex("#0cf")).toEqual([0, 204, 255]);
  expect(parseHex("#Aa10FF")).toEqual([170, 16, 255]);
});

test("invalid colours cannot silently become black or CSS expressions", () => {
  for (const value of ["red", "", "#12", "#12345g", "#12345678", "rgb(0,0,0)"]) {
    expect(() => parseHex(value)).toThrow();
  }
});
