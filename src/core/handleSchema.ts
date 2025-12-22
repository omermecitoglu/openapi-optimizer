import { randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { omit } from "~/utils/omit";
import type { SchemaObject } from "@omer-x/json-schema-types";

export function handleSchema(schema: SchemaObject, storedSchemas: Record<string, SchemaObject>): SchemaObject {
  if ("$ref" in schema) return schema;

  for (const [storedSchemaName, storedSchema] of Object.entries(storedSchemas)) {
    if (isDeepStrictEqual(omit(schema, "$schema"), omit(storedSchema, "$schema"))) {
      return {
        $ref: `#/components/schemas/${storedSchemaName}`,
      };
    }
  }

  if ("oneOf" in schema && schema.oneOf) {
    schema.oneOf = schema.oneOf.map(s => handleSchema(s, storedSchemas));
  }
  if ("anyOf" in schema && schema.anyOf) {
    schema.anyOf = schema.anyOf.map(s => handleSchema(s, storedSchemas));
  }
  if (schema.type === "object") {
    if (schema.properties) {
      const entries = Object.entries(schema.properties).map(([propertyName, propertySchema]) => {
        return [propertyName, handleSchema(propertySchema, storedSchemas)] as const;
      });
      schema.properties = Object.fromEntries(entries);
    }
    if (typeof schema.additionalProperties === "object") {
      schema.additionalProperties = handleSchema(schema.additionalProperties, storedSchemas);
    }
  }
  if (schema.type === "array") {
    if (typeof schema.items === "object") {
      schema.items = handleSchema(schema.items, storedSchemas);
    }
    if (schema.prefixItems) {
      schema.prefixItems = schema.prefixItems.map(s => handleSchema(s, storedSchemas));
    }
  }

  const schemaName = "Schema" + randomUUID().toUpperCase().replace(/-/g, "");
  storedSchemas[schemaName] = schema;
  return {
    $ref: `#/components/schemas/${schemaName}`,
  };
}
