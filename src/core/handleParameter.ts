import { handleSchema } from "./handleSchema";
import type { SchemaObject } from "@omer-x/json-schema-types";
import type { ParameterObject } from "@omer-x/openapi-types/parameter";

export function handleParameter(
  parameter: ParameterObject,
  storedSchemas: Record<string, SchemaObject>,
): ParameterObject {
  if (parameter.schema) {
    parameter.schema = handleSchema(parameter.schema, storedSchemas);
  }
  return parameter;
}
