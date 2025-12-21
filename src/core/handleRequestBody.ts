import { handleMediaType } from "./handleMediaType";
import type { SchemaObject } from "@omer-x/json-schema-types";
import type { RequestBodyObject } from "@omer-x/openapi-types/request-body";

export function handleRequestBody(
  requestBody: RequestBodyObject,
  storedSchemas: Record<string, SchemaObject>,
): RequestBodyObject {
  const entries = Object.entries(requestBody.content).map(([mimeType, mediaType]) => {
    return [mimeType, handleMediaType(mediaType, storedSchemas)] as const;
  });
  requestBody.content = Object.fromEntries(entries);
  return requestBody;
}
