import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { BadRequestException, handleException } from 'commons/exceptions';
import {isNumber} from 'util';
import Response from 'commons/response';
import { TermsService } from 'services/terms.service';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);
    const userId = +event.requestContext.authorizer['principalId'];

    const requestBody = JSON.parse(event.body);
    console.log(requestBody);

    const { id:termsId } = requestBody;
    const { enterpriseId } = event.pathParameters;

    try {

        if(!termsId) 
        throw new BadRequestException('SCF.LIBERA.405');

        if(!isNumber(termsId)) 
            throw new BadRequestException('SCF.LIBERA.404');
        
        if(!isNumber(+enterpriseId)) 
            throw new BadRequestException('SCF.LIBERA.406');

        await TermsService.acceptTerms(+termsId, +userId, +enterpriseId);
        return Response.NoContent();
    } catch (errors) {
        console.error(errors);
        return handleException(errors);
    }
}