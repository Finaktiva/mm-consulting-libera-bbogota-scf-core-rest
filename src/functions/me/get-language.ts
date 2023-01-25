import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException } from 'commons/exceptions';
import { MeService } from 'services/me.service';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`Handler: Starting ${context.functionName} `);
    try {
        const userId = event.requestContext.authorizer.principalId;

        const language = await MeService.getLanguage(+userId);

        console.log(`Handler: Ending ${context.functionName} `);
        return Response.Ok(language);
    }
    catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }

}