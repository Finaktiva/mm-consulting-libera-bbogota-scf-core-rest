import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { CatalogService } from 'services/catalog.service';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);
    try {
        const result = await CatalogService.getCitiesAndDepartments();

        console.log(`HANDLER: Ending ${context.functionName}`);

        return Response.Ok(result);
      } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
      }
}