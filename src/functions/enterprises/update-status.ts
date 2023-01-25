const middy = require('middy');
import { APIGatewayProxyEvent, APIGatewayProxyHandler, Callback, Context } from 'aws-lambda';
import { parseEnterpriseDocumentationStatus } from 'commons/enums/enterprise-documentation-status.enum';
import { PermissionEnum } from 'commons/enums/permission.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import Response from 'commons/response';
import { EnterpriseService } from 'services/enterprise.service';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context, cb: Callback) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        const { enterpriseId, documentationId } = event.pathParameters;
        const { status, explanation, expeditionDate } = JSON.parse(event.body);

        if (!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        if (!documentationId) throw new BadRequestException('SCF.LIBERA.30');
        if (!status) throw new BadRequestException('SCF.LIBERA.31');
        if (!parseEnterpriseDocumentationStatus(status)) throw new BadRequestException('SCF.LIBERA.32');
        if (explanation.length > 500)
            throw new BadRequestException('SCF.LIBERA.269');

        const userId = event.requestContext.authorizer.principalId;

        await EnterpriseService.updateDocumentationStatus(+enterpriseId, +documentationId, { status, explanation, expeditionDate }, userId);

        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.NoContent();
    }
    catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.APPROVE_DOCUMENTS
        ]
    }));