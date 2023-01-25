const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { ClientsAndContactsService } from 'services/clients-and-contacts.service';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';


const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        const { document_type, document_number } = event.queryStringParameters;
        const trmnalId = event.requestContext.identity.sourceIp;

        console.log(`==> document_type: ${document_type}`);
        console.log(`==> document_number ${document_number}`);

        if(!document_number || document_number.length < 1) {
            throw new BadRequestException('SCF.LIBERA.270');
        }

        let responseFromApi = await ClientsAndContactsService.getInformation(trmnalId, document_type, document_number);

        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.Ok(responseFromApi,{});
    
      } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
      }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.CREATE_ENTERPRISE,
            PermissionEnum.CREATE_PROVIDER
        ]
    }));