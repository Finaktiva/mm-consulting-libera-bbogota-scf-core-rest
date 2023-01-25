import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { MeService } from 'services/me.service';
import { MeSaveLanguage } from 'commons/interfaces/me-interfaces/save-language.interface';
import { parseCatLanguage } from 'commons/enums/cat-language.enum';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`Handler: Starting ${context.functionName} `);
    try {
        if(!event.body) throw new BadRequestException('SCF.LIBERA.49');
        const userId = event.requestContext.authorizer.principalId;
        const body: MeSaveLanguage = JSON.parse(event.body);

        if(!body.code) throw new BadRequestException('SCF.LIBERA.49');
        if(body.code && !parseCatLanguage(body.code))
            throw new BadRequestException('SCF.LIBERA.200', { code: body.code }); 

        await MeService.saveLanguage(+userId, body);

        console.log(`Handler: Ending ${context.functionName} `);
        return Response.NoContent();
    }
    catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }

}