import { handleSchema } from "./handleSchema";
import type { SchemaObject } from "@omer-x/json-schema-types";
import type { MediaTypeObject } from "@omer-x/openapi-types/media-type";

export function handleMediaType(
  mediaType: MediaTypeObject,
  storedSchemas: Record<string, SchemaObject>,
): MediaTypeObject {
  if (mediaType.schema) {
    mediaType.schema = handleSchema(mediaType.schema, storedSchemas);
  }
  return mediaType;
}
