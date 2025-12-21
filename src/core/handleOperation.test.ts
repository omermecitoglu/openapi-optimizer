import { describe, expect, it } from "vitest";
import { handleOperation } from "./handleOperation";
import type { SchemaObject } from "@omer-x/json-schema-types";
import type { OperationObject } from "@omer-x/openapi-types/operation";
import type { RequestBodyObject } from "@omer-x/openapi-types/request-body";

/* eslint-disable @stylistic/max-len */

describe("handleOperation", () => {
  it("should return the operation unchanged if no parameters, requestBody, or responses", () => {
    const input: OperationObject = {
      summary: "Test operation",
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleOperation(input, storedSchemas);

    expect(output).toBe(input);
    expect(output).toEqual({
      summary: "Test operation",
    });
    expect(storedSchemas).toEqual({});
  });

  it("should handle operation with parameters", () => {
    const input: OperationObject = {
      parameters: [
        {
          name: "param1",
          in: "query",
          schema: { type: "string" },
        },
        {
          $ref: "#/components/parameters/Param2",
        },
      ],
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleOperation(input, storedSchemas);

    expect(output).toBe(input);
    expect(output.parameters).toHaveLength(2);
    expect(output.parameters![0]).toEqual({
      name: "param1",
      in: "query",
      schema: {
        $ref: expect.stringMatching(/^#\/components\/schemas\/Schema[A-F0-9]+$/),
      },
    });
    expect(output.parameters![1]).toEqual({
      $ref: "#/components/parameters/Param2",
    });
    expect(Object.keys(storedSchemas)).toHaveLength(1);
  });

  it("should handle operation with requestBody not ref", () => {
    const input: OperationObject = {
      requestBody: {
        content: {
          "application/json": {
            schema: { type: "object" },
          },
        },
      },
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleOperation(input, storedSchemas);

    expect(output).toBe(input);
    expect(output.requestBody).toBeDefined();
    expect(((output.requestBody as RequestBodyObject).content["application/json"]!.schema as { $ref: string }).$ref).toMatch(/^#\/components\/schemas\/Schema[A-F0-9]+$/);
    expect(Object.keys(storedSchemas)).toHaveLength(1);
  });

  it("should not handle operation with requestBody ref", () => {
    const input: OperationObject = {
      requestBody: {
        $ref: "#/components/requestBodies/Body1",
      },
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleOperation(input, storedSchemas);

    expect(output).toBe(input);
    expect(output.requestBody).toEqual({
      $ref: "#/components/requestBodies/Body1",
    });
    expect(storedSchemas).toEqual({});
  });

  it("should handle operation with responses", () => {
    const input: OperationObject = {
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: { type: "array" },
            },
          },
        },
        404: {
          $ref: "#/components/responses/NotFound",
        },
      },
    };
    const storedSchemas: Record<string, SchemaObject> = {};

    const output = handleOperation(input, storedSchemas);

    expect(output).toBe(input);
    expect(output.responses!["200"]).toEqual({
      description: "Success",
      content: {
        "application/json": {
          schema: {
            $ref: expect.stringMatching(/^#\/components\/schemas\/Schema[A-F0-9]+$/),
          },
        },
      },
    });
    expect(output.responses!["404"]).toEqual({
      $ref: "#/components/responses/NotFound",
    });
    expect(Object.keys(storedSchemas)).toHaveLength(1);
  });
});
