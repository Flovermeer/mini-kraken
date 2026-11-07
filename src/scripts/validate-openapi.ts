import SwaggerParser from '@apidevtools/swagger-parser';

await SwaggerParser.validate('src/api/openapi.yaml');

console.log('OpenAPI contract valid!');