import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleMediaType } from "./handleMediaType";
import type { SchemaObject } from "@omer-x/json-schema-types";
import type { MediaTypeObject } from "@omer-x/openapi-types/media-type";

vi.mock("./handleSchema", () => ({
  handleSchema: vi.fn(),
}));

const { handleSchema } = await import("./handleSchema");

describe("handleMediaType", () => {
  const storedSchemas: Record<string, SchemaObject> = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle media type with schema", () => {
    const originalSchema: SchemaObject = { type: "string" };
    const processedSchema: SchemaObject = { $ref: "#/components/schemas/String" };
    const input: MediaTypeObject = {
      schema: originalSchema,
    };
    const expected: MediaTypeObject = {
      schema: processedSchema,
    };

    vi.mocked(handleSchema).mockReturnValue(processedSchema);

    const result = handleMediaType(input, storedSchemas);

    expect(vi.mocked(handleSchema)).toHaveBeenCalledWith(originalSchema, storedSchemas);
    expect(result).toEqual(expected);
  });

  it("should handle media type without schema", () => {
    const input: MediaTypeObject = {
      example: "some example",
    };
    const expected: MediaTypeObject = {
      example: "some example",
    };

    const result = handleMediaType(input, storedSchemas);

    expect(vi.mocked(handleSchema)).not.toHaveBeenCalled();
    expect(result).toEqual(expected);
  });
});
