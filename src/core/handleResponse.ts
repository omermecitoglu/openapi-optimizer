import { handleMediaType } from "./handleMediaType";
import { handleParameter } from "./handleParameter";
import type { SchemaObject } from "@omer-x/json-schema-types";
import type { ParameterObject } from "@omer-x/openapi-types/parameter";
import type { ResponseObject } from "@omer-x/openapi-types/response";

export function handleResponse(
  response: ResponseObject,
  storedSchemas: Record<string, SchemaObject>,
): ResponseObject {
  if (response.headers) {
    const entries = Object.entries(response.headers).map(([headerName, header]) => {
      if ("$ref" in header) {
        return [headerName, header] as const;
      }
      return [headerName, handleParameter(header as ParameterObject, storedSchemas)] as const;
    });
    response.headers = Object.fromEntries(entries);
  }
  if (response.content) {
    const entries = Object.entries(response.content).map(([mimeType, mediaType]) => {
      return [mimeType, handleMediaType(mediaType, storedSchemas)] as const;
    });
    response.content = Object.fromEntries(entries);
  }
  return response;
}
