import { describe, expect, it } from "vitest";
import { optimizeOpenApiSpec } from "./index";

describe("optimizeOpenApiSpec", () => {
  it("should be a function", () => {
    expect(typeof optimizeOpenApiSpec).toBe("function");
  });
});
