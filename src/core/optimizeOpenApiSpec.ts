import { countOccurrences } from "~/utils/countOccurrences";
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

  const text = JSON.stringify(outputSpec);
  const uniqueSchemas: Record<string, unknown> = {};
  for (const schemaName in storedSchemas) {
    if (schemaName.startsWith("Schema")) {
      const count = countOccurrences(`#/components/schemas/${schemaName}`, text);
      if (count < 2) {
        uniqueSchemas[schemaName] = storedSchemas[schemaName];
      }
    }
  }

  let stringifiedSpec = JSON.stringify(outputSpec);
  for (const [schemaName, schemaDefinition] of Object.entries(uniqueSchemas).toReversed()) {
    const ref = JSON.stringify({
      $ref: `#/components/schemas/${schemaName}`,
    });
    const schema = JSON.stringify(schemaDefinition);
    stringifiedSpec = stringifiedSpec.replaceAll(ref, schema);
  }

  const spec = JSON.parse(stringifiedSpec) as OpenApiDocument;

  for (const schemaName in uniqueSchemas) {
    delete spec.components?.schemas?.[schemaName];
  }

  if (spec.components?.schemas && Object.keys(spec.components.schemas).length === 0) {
    delete spec.components.schemas;
  }

  return spec;
}
