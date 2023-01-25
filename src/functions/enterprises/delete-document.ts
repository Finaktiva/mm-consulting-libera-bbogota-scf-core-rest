import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { EnterpriseService } from 'services/enterprise.service';
import Response from 'commons/response';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context, cb: Callback) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        const { enterpriseId, documentationId } = event.pathParameters;

        if(!enterpriseId || enterpriseId === undefined || !documentationId || documentationId === undefined) throw new BadRequestException('SCF.LIBERA.23');
        
        await EnterpriseService.deleteDocument(+enterpriseId,+documentationId);
        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.NoContent();
        
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }

}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.DELETE_DOCUMENTS
        ]
    }));