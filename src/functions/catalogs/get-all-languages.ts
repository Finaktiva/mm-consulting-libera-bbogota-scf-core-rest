import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from "aws-lambda";
import { CatalogService } from "services/catalog.service";
import Response from 'commons/response';
import { handleException } from "commons/exceptions";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        const result = await CatalogService.getAllLanguages();
        
        console.log(`HANDLER: Ending ${context.functionName} method...`);
        return Response.Ok(result.languages, { 'X-Total-Count': result.total });
    }    
    catch(errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}