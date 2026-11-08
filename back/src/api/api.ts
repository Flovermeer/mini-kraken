import SwaggerParser from "@apidevtools/swagger-parser";
import { type OpenAPIV3 } from "openapi-types";

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';
const api = await SwaggerParser.validate('../openapi/openapi.yaml') as OpenAPIV3.Document;

export function getApi() {
    return api;
}

export function getPhotosApi(route: string) {
    return api.paths?.[`photos${route}`];
}

export function getDevicesApiValidationSchema(route: string, operation: Method) {
    const path = api.paths?.[`/devices${route}`];
    const body = path?.[operation]?.requestBody as OpenAPIV3.RequestBodyObject;
    return body.content['application/json']?.schema as OpenAPIV3.SchemaObject;
}

export function getDevicesApiResponseSchema(route: string, operation: Method) {
    const path = api.paths?.[`/devices${route}`];
    return path?.[operation]?.responses as OpenAPIV3.ResponsesObject | undefined;
}