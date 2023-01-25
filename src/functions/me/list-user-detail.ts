import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException } from 'commons/exceptions';
import { MeService } from 'services/me.service';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`Handler: Starting ${context.functionName} `);
    try {
        const userId = event.requestContext.authorizer.principalId;

        const user = await MeService.getUserDetail(+userId);

        console.log(`Handler: Ending ${context.functionName} `);
        return Response.Ok(user);
    }
    catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }

}