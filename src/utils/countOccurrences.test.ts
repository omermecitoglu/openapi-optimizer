import { describe, expect, it } from "vitest";
import { countOccurrences } from "./countOccurrences";

describe("countOccurrences", () => {
  it("should count the occurrences in a text", () => {
    const text = "Hello there! How are you today? Are you all right?";
    const result = countOccurrences("you", text);
    expect(result).toBe(2);
  });
});
