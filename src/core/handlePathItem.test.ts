import { describe, expect, it } from "vitest";
import { handlePathItem } from "./handlePathItem";
import type { PathItemObject } from "@omer-x/openapi-types/paths";

describe("handlePathItem", () => {
  it("should handle path item with no operations", () => {
    const input: PathItemObject = {};
    const storedSchemas = {};

    const output = handlePathItem(input, storedSchemas);

    expect(output).toEqual({});
  });

  it("should handle path item with all operations", () => {
    const input: PathItemObject = {
      get: {},
      put: {},
      post: {},
      delete: {},
      options: {},
      head: {},
      patch: {},
      trace: {},
    };
    const storedSchemas = {};

    const output = handlePathItem(input, storedSchemas);

    expect(output).toEqual(input);
  });
});
