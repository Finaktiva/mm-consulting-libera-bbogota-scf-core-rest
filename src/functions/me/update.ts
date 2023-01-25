import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import Response from 'commons/response';
import { MeService } from 'services/me.service';
import LiberaUtils from 'commons/libera.utils';

export const handler : APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        const userId = event.requestContext.authorizer.principalId;
        const { name, firstSurname, secondSurname } = JSON.parse(event.body);
        if(!event.body) throw new BadRequestException('SCF.LIBERA.95');
        
        if(name && LiberaUtils.checkString(name) || 
        firstSurname && LiberaUtils.checkString(firstSurname) || 
        secondSurname && LiberaUtils.checkString(secondSurname))
            throw new BadRequestException('SCF.LIBERA.229');

        await MeService.updateUserDetail(userId, {name, firstSurname, secondSurname});
        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.NoContent();
    } catch (errors) {
        console.log('HANDLER ERRORS:', {errors});
        return handleException(errors);
    }
}