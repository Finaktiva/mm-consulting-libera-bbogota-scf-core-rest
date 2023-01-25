import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { S3Service } from 'services/s3.service';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`Handler: Starting ${context.functionName}`);
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        const userId = +event.requestContext.authorizer['principalId'];
        const { filename, contentType, enterpriseId } = JSON.parse(event.body);
        const enterpriseIdCognito = event.requestContext.authorizer['custom:enterpriseId'];
        const enterpriseid = enterpriseId ? enterpriseId : enterpriseIdCognito;

        if (!filename) throw new BadRequestException("SCF.LIBERA.24", { variable: "filename" });

        const response = await S3Service.createCredentialsPath(filename, contentType, enterpriseid, userId);
        console.log(`Handler: Ending ${context.functionName}`);
        return Response.Ok(response);
    }
    catch (error) {
        console.log('HANDLER ERRORS: ', error);
        return handleException(error);
    }
}