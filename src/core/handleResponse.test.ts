import { describe, expect, it } from "vitest";
import { handleResponse } from "./handleResponse";
import type { SchemaObject } from "@omer-x/json-schema-types";
import type { ResponseObject } from "@omer-x/openapi-types/response";

describe("handleResponse", () => {
  it("should return the response unchanged if no headers or content are present", () => {
    const input: ResponseObject = {
      description: "A simple response",
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleResponse(input, storedSchemas);

    expect(output).toEqual({
      description: "A simple response",
    });
    expect(storedSchemas).toEqual({});
  });

  it("should handle response with headers containing $ref", () => {
    const input: ResponseObject = {
      description: "Response with ref header",
      headers: {
        "X-Custom-Header": {
          $ref: "#/components/headers/CustomHeader",
        },
      },
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleResponse(input, storedSchemas);

    expect(output).toEqual({
      description: "Response with ref header",
      headers: {
        "X-Custom-Header": {
          $ref: "#/components/headers/CustomHeader",
        },
      },
    });
    expect(storedSchemas).toEqual({});
  });

  it("should handle response with headers not containing $ref", () => {
    const input: ResponseObject = {
      description: "Response with header",
      headers: {
        "X-Custom-Header": {
          description: "A custom header",
          schema: {
            type: "string",
          },
        },
      },
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleResponse(input, storedSchemas);

    expect(output).toEqual({
      description: "Response with header",
      headers: {
        "X-Custom-Header": {
          description: "A custom header",
          schema: {
            $ref: expect.stringMatching(/^#\/components\/schemas\/Schema[A-F0-9]+$/),
          },
        },
      },
    });
    expect(Object.keys(storedSchemas)).toHaveLength(1);
    expect(Object.values(storedSchemas)[0]).toEqual({
      type: "string",
    });
  });

  it("should handle response with content", () => {
    const input: ResponseObject = {
      description: "Response with content",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              id: {
                type: "integer",
              },
            },
          },
        },
      },
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleResponse(input, storedSchemas);

    expect(output).toEqual({
      description: "Response with content",
      content: {
        "application/json": {
          schema: {
            $ref: expect.stringMatching(/^#\/components\/schemas\/Schema[A-F0-9]+$/),
          },
        },
      },
    });
    expect(Object.keys(storedSchemas)).toHaveLength(2);
    expect(Object.values(storedSchemas)).toContainEqual({
      type: "object",
      properties: {
        id: {
          $ref: expect.stringMatching(/^#\/components\/schemas\/Schema[A-F0-9]+$/),
        },
      },
    });
    expect(Object.values(storedSchemas)).toContainEqual({
      type: "integer",
    });
  });

  it("should handle response with both headers and content", () => {
    const input: ResponseObject = {
      description: "Response with headers and content",
      headers: {
        "X-Rate-Limit": {
          description: "Rate limit header",
          schema: {
            type: "integer",
          },
        },
      },
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      },
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleResponse(input, storedSchemas);

    expect(output).toEqual({
      description: "Response with headers and content",
      headers: {
        "X-Rate-Limit": {
          description: "Rate limit header",
          schema: {
            $ref: expect.stringMatching(/^#\/components\/schemas\/Schema[A-F0-9]+$/),
          },
        },
      },
      content: {
        "application/json": {
          schema: {
            $ref: expect.stringMatching(/^#\/components\/schemas\/Schema[A-F0-9]+$/),
          },
        },
      },
    });
    expect(Object.keys(storedSchemas)).toHaveLength(3);
  });

  it("should handle response with empty headers and content", () => {
    const input: ResponseObject = {
      description: "Response with empty headers and content",
      headers: {},
      content: {},
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleResponse(input, storedSchemas);

    expect(output).toEqual({
      description: "Response with empty headers and content",
      headers: {},
      content: {},
    });
    expect(storedSchemas).toEqual({});
  });
});
