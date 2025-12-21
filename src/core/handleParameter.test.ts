import { describe, expect, it } from "vitest";
import { handleParameter } from "./handleParameter";
import type { SchemaObject } from "@omer-x/json-schema-types";
import type { ParameterObject } from "@omer-x/openapi-types/parameter";

describe("handleParameter", () => {
  it("should return the parameter unchanged if no schema is present", () => {
    const input: ParameterObject = {
      name: "testParam",
      in: "query",
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleParameter(input, storedSchemas);

    expect(output).toEqual({
      name: "testParam",
      in: "query",
    });
  });

  it("should handle parameter with schema", () => {
    const input: ParameterObject = {
      name: "testParam",
      in: "query",
      schema: {
        type: "string",
      },
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleParameter(input, storedSchemas);

    expect(output).toEqual({
      name: "testParam",
      in: "query",
      schema: {
        $ref: expect.stringMatching(/^#\/components\/schemas\/Schema[A-F0-9]+$/),
      },
    });
    expect(Object.keys(storedSchemas)).toHaveLength(1);
    expect(Object.values(storedSchemas)[0]).toEqual({
      type: "string",
    });
  });
});
