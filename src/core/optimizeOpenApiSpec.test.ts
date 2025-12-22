import { describe, expect, it } from "vitest";
import { optimizeOpenApiSpec } from "./optimizeOpenApiSpec";
import type { OpenApiDocument } from "@omer-x/openapi-types";
import type { ParameterObject } from "@omer-x/openapi-types/parameter";
import type { RequestBodyObject } from "@omer-x/openapi-types/request-body";
import type { ResponseObject } from "@omer-x/openapi-types/response";

/* eslint-disable @stylistic/max-len */

describe("optimizeOpenApiSpec", () => {
  it("should handle empty spec", () => {
    const input = {
      openapi: "3.1.0",
      info: { title: "Test", version: "1.0.0" },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    expect(output).toEqual(input);
  });

  it("should handle spec with paths but no components", () => {
    const input = {
      openapi: "3.1.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {
        "/test": {
          get: {
            responses: {
              200: {
                description: "OK",
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    expect(output).toEqual(input);
  });

  it("should optimize schemas in parameters", () => {
    const input = {
      openapi: "3.1.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {
        "/test": {
          get: {
            parameters: [
              {
                name: "id",
                in: "query",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "OK",
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    expect((output.paths?.["/test"]?.get?.parameters?.[0] as ParameterObject).schema).toEqual({
      type: "string",
    });
    // Since used only once, inlined and removed from components
    expect(output.components?.schemas).toBeUndefined();
  });

  it("should optimize schemas in requestBody", () => {
    const input = {
      openapi: "3.1.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {
        "/test": {
          post: {
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                    },
                  },
                },
              },
            },
            responses: {
              200: {
                description: "OK",
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    const schema = (output.paths?.["/test"]?.post?.requestBody as RequestBodyObject).content["application/json"]?.schema;
    expect(schema).toEqual({
      type: "object",
      properties: {
        name: { type: "string" },
      },
    });
    // Inlined since used once
    expect(output.components?.schemas).toBeUndefined();
  });

  it("should optimize schemas in responses", () => {
    const input = {
      openapi: "3.1.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {
        "/test": {
          get: {
            responses: {
              200: {
                description: "OK",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    const schema = (output.paths?.["/test"]?.get?.responses?.["200"] as ResponseObject).content?.["application/json"]?.schema;
    expect(schema).toEqual({
      type: "array",
      items: { type: "number" },
    });
    // Inlined
    expect(output.components?.schemas).toBeUndefined();
  });

  it("should handle existing components schemas", () => {
    const input = {
      openapi: "3.1.0",
      info: { title: "Test", version: "1.0.0" },
      components: {
        schemas: {
          ExistingSchema: { type: "string" },
        },
      },
      paths: {
        "/test": {
          get: {
            parameters: [
              {
                name: "id",
                in: "query",
                schema: { type: "string" },
              },
            ],
            responses: {
              200: {
                description: "OK",
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    expect(output.components?.schemas?.ExistingSchema).toEqual({ type: "string" });
    expect((output.paths?.["/test"]?.get?.parameters?.[0] as ParameterObject).schema).toEqual({
      $ref: "#/components/schemas/ExistingSchema",
    });
  });

  it("should handle $ref parameters", () => {
    const input = {
      openapi: "3.1.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {
        "/test": {
          get: {
            parameters: [
              {
                $ref: "#/components/parameters/TestParam",
              },
            ],
            responses: {
              200: {
                description: "OK",
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    expect(output).toEqual(input);
  });

  it("should handle $ref requestBody", () => {
    const input = {
      paths: {
        "/test": {
          post: {
            requestBody: {
              $ref: "#/components/requestBodies/TestBody",
            },
            responses: {
              200: {
                description: "OK",
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    expect(output).toEqual(input);
  });

  it("should handle $ref responses", () => {
    const input = {
      paths: {
        "/test": {
          get: {
            responses: {
              200: {
                $ref: "#/components/responses/TestResponse",
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    expect(output).toEqual(input);
  });

  it("should handle nested schemas", () => {
    const input = {
      paths: {
        "/test": {
          post: {
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          age: { type: "number" },
                        },
                      },
                    },
                  },
                },
              },
            },
            responses: {
              200: {
                description: "OK",
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    const schema = (output.paths?.["/test"]?.post?.requestBody as RequestBodyObject).content["application/json"]?.schema;
    expect(schema).toEqual({
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
        },
      },
    });
    // All schemas inlined since unique
    expect(output.components?.schemas).toBeUndefined();
  });

  it("should handle oneOf and anyOf", () => {
    const input = {
      paths: {
        "/test": {
          post: {
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { type: "string" },
                      { type: "number" },
                    ],
                    anyOf: [
                      { type: "boolean" },
                    ],
                  },
                },
              },
            },
            responses: {
              200: {
                description: "OK",
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    const schema = (output.paths?.["/test"]?.post?.requestBody as RequestBodyObject).content["application/json"]?.schema;
    expect(schema).toEqual({
      oneOf: [
        { type: "string" },
        { type: "number" },
      ],
      anyOf: [
        { type: "boolean" },
      ],
    });
    // Inlined
    expect(output.components?.schemas).toBeUndefined();
  });

  it("should handle array items", () => {
    const input = {
      paths: {
        "/test": {
          get: {
            responses: {
              200: {
                description: "OK",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    const schema = (output.paths?.["/test"]?.get?.responses?.["200"] as ResponseObject).content?.["application/json"]?.schema;
    expect(schema).toEqual({
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
      },
    });
    // Inlined
    expect(output.components?.schemas).toBeUndefined();
  });

  it("should handle additionalProperties", () => {
    const input = {
      paths: {
        "/test": {
          post: {
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    additionalProperties: {
                      type: "string",
                    },
                  },
                },
              },
            },
            responses: {
              200: {
                description: "OK",
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    const schema = (output.paths?.["/test"]?.post?.requestBody as RequestBodyObject).content["application/json"]?.schema;
    expect(schema).toEqual({
      type: "object",
      additionalProperties: {
        type: "string",
      },
    });
    // Inlined
    expect(output.components?.schemas).toBeUndefined();
  });

  it("should handle prefixItems", () => {
    const input = {
      paths: {
        "/test": {
          post: {
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    prefixItems: [
                      { type: "string" },
                      { type: "number" },
                    ],
                  },
                },
              },
            },
            responses: {
              200: {
                description: "OK",
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    const schema = (output.paths?.["/test"]?.post?.requestBody as RequestBodyObject).content["application/json"]?.schema;
    expect(schema).toEqual({
      type: "array",
      prefixItems: [
        { type: "string" },
        { type: "number" },
      ],
    });
    // Inlined
    expect(output.components?.schemas).toBeUndefined();
  });

  it("should handle response headers", () => {
    const input = {
      paths: {
        "/test": {
          get: {
            responses: {
              200: {
                description: "OK",
                headers: {
                  "X-Rate-Limit": {
                    schema: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    const headerSchema = ((output.paths?.["/test"]?.get?.responses?.["200"] as ResponseObject).headers?.["X-Rate-Limit"] as ParameterObject).schema;
    expect(headerSchema).toEqual({ type: "integer" });
    // Inlined
    expect(output.components?.schemas).toBeUndefined();
  });

  it("should handle $ref in response headers", () => {
    const input = {
      paths: {
        "/test": {
          get: {
            responses: {
              200: {
                description: "OK",
                headers: {
                  "X-Rate-Limit": {
                    $ref: "#/components/headers/TestHeader",
                  },
                },
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    expect(output).toEqual(input);
  });

  it("should handle multiple HTTP methods", () => {
    const input = {
      paths: {
        "/test": {
          get: {
            responses: {
              200: {
                description: "OK",
              },
            },
          },
          post: {
            responses: {
              201: {
                description: "Created",
              },
            },
          },
          put: {
            responses: {
              204: {
                description: "No Content",
              },
            },
          },
          delete: {
            responses: {
              204: {
                description: "No Content",
              },
            },
          },
          options: {
            responses: {
              200: {
                description: "OK",
              },
            },
          },
          head: {
            responses: {
              200: {
                description: "OK",
              },
            },
          },
          patch: {
            responses: {
              200: {
                description: "OK",
              },
            },
          },
          trace: {
            responses: {
              200: {
                description: "OK",
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    expect(output).toEqual(input);
  });

  it("should reuse existing schemas", () => {
    const input = {
      paths: {
        "/test1": {
          get: {
            parameters: [
              {
                name: "id",
                in: "query",
                schema: { type: "string" },
              },
            ],
            responses: {
              200: {
                description: "OK",
              },
            },
          },
        },
        "/test2": {
          get: {
            parameters: [
              {
                name: "name",
                in: "query",
                schema: { type: "string" },
              },
            ],
            responses: {
              200: {
                description: "OK",
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const output = optimizeOpenApiSpec(input);

    expect(output.components?.schemas).toBeDefined();
    // Should reuse the same schema for both string types
    expect(Object.keys(output.components!.schemas!)).toHaveLength(1);
    const schemaRef1 = (output.paths?.["/test1"]?.get?.parameters?.[0] as ParameterObject).schema;
    const schemaRef2 = (output.paths?.["/test2"]?.get?.parameters?.[0] as ParameterObject).schema;
    expect(schemaRef1).toEqual(schemaRef2);
  });
});
