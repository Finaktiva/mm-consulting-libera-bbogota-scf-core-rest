import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { TermsService } from 'services/terms.service';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName}`);
  try {
    const response = await TermsService.getLatestTerm();
    console.log(`HANDLER: Ending ${context.functionName}`);
    return Response.Ok(response);
    
  } catch (errors) {
    console.error(errors);
    return handleException(errors);
  }
}