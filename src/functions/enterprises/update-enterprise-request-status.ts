const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { BadRequestException, handleException } from 'commons/exceptions';
import { isValidStatus, EnterpriseRequestStatus } from 'commons/enums/enterprise-request-status.enum';
import LiberaUtils from 'commons/libera.utils';
import { EnterpriseModuleService } from 'services/enterprise-module.service';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {
        if (!event.pathParameters) throw new BadRequestException('SCF.LIBERA.COMMON.400');
        if (!event.body) throw new BadRequestException('SCF.LIBERA.49');
        
        const userId = event.requestContext.authorizer.principalId;

        const { requestId } = event.pathParameters;
        const { status, explanation, sendEmail } = JSON.parse(event.body);
        if (!status) throw new BadRequestException('SCF.LIBERA.31');
        const statusEnum = isValidStatus(status);
        if (!statusEnum) throw new BadRequestException('SCF.LIBERA.32');
        if (statusEnum === EnterpriseRequestStatus.REJECTED && !explanation) throw new BadRequestException('SCF.LIBERA.62');
        if (!requestId) throw new BadRequestException('SCF.LIBERA.80');
        if (requestId === undefined || isNaN(+requestId)) throw new BadRequestException('SCF.LIBERA.81', { requestId });

        await EnterpriseModuleService.updateEnterpriseRequestStatus(+requestId, status, explanation, sendEmail, userId);

        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.NoContent();
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
};

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.READ_ENTERPRISE_LINKINGS_LIST
        ]
}));