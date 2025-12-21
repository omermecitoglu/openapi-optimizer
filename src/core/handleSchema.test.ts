import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { handleSchema } from "./handleSchema";
import type { SchemaObject } from "@omer-x/json-schema-types";

/* eslint-disable @stylistic/max-len */

vi.mock("node:crypto", () => ({ randomUUID: vi.fn() }));

describe("handleSchema", () => {
  it("should return schema as is if it has $ref", () => {
    const input: SchemaObject = {
      $ref: "#/components/schemas/Example",
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleSchema(input, storedSchemas);

    expect(output).toEqual(input);
    expect(storedSchemas).toEqual({});
  });

  it("should return ref if schema matches a stored one", () => {
    const input: SchemaObject = {
      type: "string",
    };
    const storedSchemas: Record<string, SchemaObject> = {
      ExistingSchema: {
        type: "string",
      },
    };

    const output = handleSchema(input, storedSchemas);

    expect(output).toEqual({
      $ref: "#/components/schemas/ExistingSchema",
    });
    expect(storedSchemas).toEqual({
      ExistingSchema: {
        type: "string",
      },
    });
  });

  it("should handle oneOf by mapping each schema", () => {
    vi.mocked(randomUUID).mockReturnValueOnce("11111111-1111-1111-1111-111111111111").mockReturnValueOnce("22222222-2222-2222-2222-222222222222").mockReturnValueOnce("33333333-3333-3333-3333-333333333333");
    const input: SchemaObject = {
      oneOf: [
        { type: "string" },
        { type: "number" },
      ],
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleSchema(input, storedSchemas);

    expect((input as { oneOf: SchemaObject[] }).oneOf[0]).toEqual({ $ref: "#/components/schemas/Schema11111111111111111111111111111111" });
    expect((input as { oneOf: SchemaObject[] }).oneOf[1]).toEqual({ $ref: "#/components/schemas/Schema22222222222222222222222222222222" });
    expect(output).toEqual({ $ref: "#/components/schemas/Schema33333333333333333333333333333333" });
    expect(storedSchemas).toEqual({
      Schema11111111111111111111111111111111: { type: "string" },
      Schema22222222222222222222222222222222: { type: "number" },
      Schema33333333333333333333333333333333: input,
    });
  });

  it("should handle anyOf by mapping each schema", () => {
    vi.mocked(randomUUID).mockReturnValueOnce("44444444-4444-4444-4444-444444444444").mockReturnValueOnce("55555555-5555-5555-5555-555555555555").mockReturnValueOnce("66666666-6666-6666-6666-666666666666");
    const input: SchemaObject = {
      anyOf: [
        { type: "boolean" },
        { type: "null" },
      ],
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleSchema(input, storedSchemas);

    expect((input as { anyOf: SchemaObject[] }).anyOf[0]).toEqual({ $ref: "#/components/schemas/Schema44444444444444444444444444444444" });
    expect((input as { anyOf: SchemaObject[] }).anyOf[1]).toEqual({ $ref: "#/components/schemas/Schema55555555555555555555555555555555" });
    expect(output).toEqual({ $ref: "#/components/schemas/Schema66666666666666666666666666666666" });
    expect(storedSchemas).toEqual({
      Schema44444444444444444444444444444444: { type: "boolean" },
      Schema55555555555555555555555555555555: { type: "null" },
      Schema66666666666666666666666666666666: input,
    });
  });

  it("should handle object properties", () => {
    vi.mocked(randomUUID).mockReturnValueOnce("77777777-7777-7777-7777-777777777777").mockReturnValueOnce("88888888-8888-8888-8888-888888888888").mockReturnValueOnce("99999999-9999-9999-9999-999999999999");
    const input: SchemaObject = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
      },
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleSchema(input, storedSchemas);

    expect((input as { properties: Record<string, SchemaObject> }).properties.name).toEqual({ $ref: "#/components/schemas/Schema77777777777777777777777777777777" });
    expect((input as { properties: Record<string, SchemaObject> }).properties.age).toEqual({ $ref: "#/components/schemas/Schema88888888888888888888888888888888" });
    expect(output).toEqual({ $ref: "#/components/schemas/Schema99999999999999999999999999999999" });
    expect(storedSchemas).toEqual({
      Schema77777777777777777777777777777777: { type: "string" },
      Schema88888888888888888888888888888888: { type: "integer" },
      Schema99999999999999999999999999999999: input,
    });
  });

  it("should handle object additionalProperties when it's an object", () => {
    vi.mocked(randomUUID).mockReturnValueOnce("AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA").mockReturnValueOnce("BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB");
    const input: SchemaObject = {
      type: "object",
      additionalProperties: { type: "string" },
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleSchema(input, storedSchemas);

    expect((input as { additionalProperties: SchemaObject }).additionalProperties).toEqual({ $ref: "#/components/schemas/SchemaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" });
    expect(output).toEqual({ $ref: "#/components/schemas/SchemaBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB" });
    expect(storedSchemas).toEqual({
      SchemaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA: { type: "string" },
      SchemaBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB: input,
    });
  });

  it("should not handle additionalProperties if it's not an object", () => {
    vi.mocked(randomUUID).mockReturnValueOnce("CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCCCCCC");
    const input: SchemaObject = {
      type: "object",
      additionalProperties: true,
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleSchema(input, storedSchemas);

    expect(input.additionalProperties).toBe(true);
    expect(output).toEqual({ $ref: "#/components/schemas/SchemaCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC" });
    expect(storedSchemas).toEqual({
      SchemaCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC: input,
    });
  });

  it("should handle array items when it's an object", () => {
    vi.mocked(randomUUID).mockReturnValueOnce("DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD").mockReturnValueOnce("EEEEEEEE-EEEE-EEEE-EEEE-EEEEEEEEEEEE");
    const input: SchemaObject = {
      type: "array",
      items: { type: "string" },
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleSchema(input, storedSchemas);

    expect((input as { items: SchemaObject }).items).toEqual({ $ref: "#/components/schemas/SchemaDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD" });
    expect(output).toEqual({ $ref: "#/components/schemas/SchemaEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" });
    expect(storedSchemas).toEqual({
      SchemaDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD: { type: "string" },
      SchemaEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE: input,
    });
  });

  it("should not handle items if it's not an object", () => {
    vi.mocked(randomUUID).mockReturnValueOnce("FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF");
    const input: SchemaObject = {
      type: "array",
      items: false,
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleSchema(input, storedSchemas);

    expect(input.items).toBe(false);
    expect(output).toEqual({ $ref: "#/components/schemas/SchemaFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF" });
    expect(storedSchemas).toEqual({
      SchemaFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF: input,
    });
  });

  it("should handle array prefixItems", () => {
    vi.mocked(randomUUID).mockReturnValueOnce("GGGGGGGG-GGGG-GGGG-GGGG-GGGGGGGGGGGG").mockReturnValueOnce("HHHHHHHH-HHHH-HHHH-HHHH-HHHHHHHHHHHH").mockReturnValueOnce("IIIIIIII-IIII-IIII-IIII-IIIIIIIIIIII");
    const input: SchemaObject = {
      type: "array",
      prefixItems: [
        { type: "string" },
        { type: "number" },
      ],
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleSchema(input, storedSchemas);

    expect((input as { prefixItems: SchemaObject[] }).prefixItems[0]).toEqual({ $ref: "#/components/schemas/SchemaGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG" });
    expect((input as { prefixItems: SchemaObject[] }).prefixItems[1]).toEqual({ $ref: "#/components/schemas/SchemaHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH" });
    expect(output).toEqual({ $ref: "#/components/schemas/SchemaIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII" });
    expect(storedSchemas).toEqual({
      SchemaGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG: { type: "string" },
      SchemaHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH: { type: "number" },
      SchemaIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII: input,
    });
  });

  it("should store the schema and return ref for a simple schema", () => {
    vi.mocked(randomUUID).mockReturnValueOnce("JJJJJJJJ-JJJJ-JJJJ-JJJJ-JJJJJJJJJJJJ");
    const input: SchemaObject = {
      type: "string",
      description: "A simple string",
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleSchema(input, storedSchemas);

    expect(output).toEqual({ $ref: "#/components/schemas/SchemaJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ" });
    expect(storedSchemas).toEqual({
      SchemaJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ: input,
    });
  });

  it("should handle nested structures", () => {
    vi.mocked(randomUUID).mockReturnValueOnce("KKKKKKKK-KKKK-KKKK-KKKK-KKKKKKKKKKKK").mockReturnValueOnce("LLLLLLLL-LLLL-LLLL-LLLL-LLLLLLLLLLLL").mockReturnValueOnce("MMMMMMMM-MMMM-MMMM-MMMM-MMMMMMMMMMMM");
    const input: SchemaObject = {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: { type: "string" },
        },
      },
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleSchema(input, storedSchemas);

    expect((input as { properties: Record<string, SchemaObject> }).properties.items).toEqual({ $ref: "#/components/schemas/SchemaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL" });
    expect((storedSchemas.SchemaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL as { items: SchemaObject }).items).toEqual({ $ref: "#/components/schemas/SchemaKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK" });
    expect(output).toEqual({ $ref: "#/components/schemas/SchemaMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM" });
    expect(storedSchemas).toEqual({
      SchemaKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK: { type: "string" },
      SchemaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL: {
        type: "array",
        items: { $ref: "#/components/schemas/SchemaKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK" },
      },
      SchemaMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM: input,
    });
  });
});
