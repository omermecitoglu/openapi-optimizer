import { describe, expect, it } from "vitest";
import { handleRequestBody } from "./handleRequestBody";
import type { SchemaObject } from "@omer-x/json-schema-types";
import type { RequestBodyObject } from "@omer-x/openapi-types/request-body";

/* eslint-disable @stylistic/max-len */

describe("handleRequestBody", () => {
  it("should handle request body with single media type containing schema", () => {
    const input: RequestBodyObject = {
      content: {
        "application/json": {
          schema: { type: "string" },
        },
      },
    };

    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleRequestBody(input, storedSchemas);

    expect(output).toBe(input);
    expect(output.content["application/json"]!.schema).toBeDefined();
    expect((output.content["application/json"]!.schema as { $ref: string }).$ref).toMatch(/^#\/components\/schemas\/Schema[A-Z0-9]+$/);
  });

  it("should handle request body with multiple media types", () => {
    const input: RequestBodyObject = {
      content: {
        "application/json": {
          schema: { type: "object", properties: { name: { type: "string" } } },
        },
        "text/plain": {},
      },
    };

    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleRequestBody(input, storedSchemas);

    expect(output).toBe(input);
    expect(output.content["application/json"]!.schema).toBeDefined();
    expect((output.content["application/json"]!.schema as { $ref: string }).$ref).toMatch(/^#\/components\/schemas\/Schema[A-Z0-9]+$/);
    expect(output.content["text/plain"]!.schema).toBeUndefined();
  });

  it("should handle request body with media type without schema", () => {
    const input: RequestBodyObject = {
      content: {
        "text/plain": {},
      },
    };

    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleRequestBody(input, storedSchemas);

    expect(output).toBe(input);
    expect(output.content["text/plain"]!.schema).toBeUndefined();
  });

  it("should handle request body with empty content", () => {
    const input: RequestBodyObject = {
      content: {},
    };

    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleRequestBody(input, storedSchemas);

    expect(output).toBe(input);
    expect(output.content).toEqual({});
  });
});
