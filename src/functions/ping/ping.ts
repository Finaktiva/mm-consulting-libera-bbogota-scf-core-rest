import { APIGatewayProxyHandler, APIGatewayEvent, Context, Callback} from 'aws-lambda';
import { PingServices } from 'services/ping.service';
import { Response } from 'lambda-proxy-utils';

export const handler: APIGatewayProxyHandler = async (_event: APIGatewayEvent, context: Context, _callback: Callback) => {
    
    context.callbackWaitsForEmptyEventLoop = false;

    let response:Object = null;

    console.log(`Handler: Starting ${context.functionName}`);
    try {
        console.log(`Handler: Ending ${context.functionName}`);
        response = await PingServices.getPing();
        return new Response({ cors: true, statusCode: 500}).send(response);
    }
    catch (errors) {
        console.log(errors);
        return new Response({ statusCode : 500, cors : true}).send('Internal Server Error (500)');
    }

}