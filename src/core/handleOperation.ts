import { handleParameter } from "./handleParameter";
import { handleRequestBody } from "./handleRequestBody";
import { handleResponse } from "./handleResponse";
import type { SchemaObject } from "@omer-x/json-schema-types";
import type { OperationObject } from "@omer-x/openapi-types/operation";

export function handleOperation(
  operation: OperationObject,
  storedSchemas: Record<string, SchemaObject>,
): OperationObject {
  if (operation.parameters) {
    operation.parameters = operation.parameters.map(parameter => {
      if ("$ref" in parameter) return parameter;
      return handleParameter(parameter, storedSchemas);
    });
  }
  if (operation.requestBody && !("$ref" in operation.requestBody)) {
    operation.requestBody = handleRequestBody(operation.requestBody, storedSchemas);
  }
  if (operation.responses) {
    const entries = Object.entries(operation.responses).map(([status, response]) => {
      if ("$ref" in response) {
        return [status, response] as const;
      }
      return [status, handleResponse(response, storedSchemas)] as const;
    });
    operation.responses = Object.fromEntries(entries);
  }
  return operation;
}
