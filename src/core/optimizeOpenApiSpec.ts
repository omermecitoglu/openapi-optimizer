import { handlePathItem } from "./handlePathItem";
import type { OpenApiDocument } from "@omer-x/openapi-types";

export function optimizeOpenApiSpec(inputSpec: OpenApiDocument): OpenApiDocument {
  const outputSpec = structuredClone(inputSpec);
  const storedSchemas = outputSpec.components?.schemas ?? {};
  if (outputSpec.paths) {
    const entries = Object.entries(outputSpec.paths).map(([pathName, pathItem]) => {
      return [pathName, handlePathItem(pathItem, storedSchemas)] as const;
    });
    outputSpec.paths = Object.fromEntries(entries);
  }
  if (Object.keys(storedSchemas).length) {
    outputSpec.components = {
      ...outputSpec.components,
      schemas: storedSchemas,
    };
  }
  return outputSpec;
}
