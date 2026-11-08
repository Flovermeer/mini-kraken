import SwaggerParser from '@apidevtools/swagger-parser';

await SwaggerParser.validate('../openapi/openapi.yaml');

console.log('OpenAPI contract valid!');