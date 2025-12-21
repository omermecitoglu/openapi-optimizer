import { handleOperation } from "./handleOperation";
import type { SchemaObject } from "@omer-x/json-schema-types";
import type { PathItemObject } from "@omer-x/openapi-types/paths";

export function handlePathItem(
  pathItem: PathItemObject,
  storedSchemas: Record<string, SchemaObject>,
): PathItemObject {
  if (pathItem.get) {
    pathItem.get = handleOperation(pathItem.get, storedSchemas);
  }
  if (pathItem.put) {
    pathItem.put = handleOperation(pathItem.put, storedSchemas);
  }
  if (pathItem.post) {
    pathItem.post = handleOperation(pathItem.post, storedSchemas);
  }
  if (pathItem.delete) {
    pathItem.delete = handleOperation(pathItem.delete, storedSchemas);
  }
  if (pathItem.options) {
    pathItem.options = handleOperation(pathItem.options, storedSchemas);
  }
  if (pathItem.head) {
    pathItem.head = handleOperation(pathItem.head, storedSchemas);
  }
  if (pathItem.patch) {
    pathItem.patch = handleOperation(pathItem.patch, storedSchemas);
  }
  if (pathItem.trace) {
    pathItem.trace = handleOperation(pathItem.trace, storedSchemas);
  }
  return pathItem;
}
