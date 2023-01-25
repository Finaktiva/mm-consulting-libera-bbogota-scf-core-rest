import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { EnterpriseService } from 'services/enterprise.service';
import Res from 'commons/response';
import { isValidEnterpriseStatus } from 'commons/enums/enterprise-status.enum';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);
    try {
        if(!event.pathParameters)throw new BadRequestException('SCF.LIBERA.COMMON.400');
        if(!event.body) throw new BadRequestException('SCF.LIBERA.49');
        const { enterpriseId } = event.pathParameters;
        const { status, explanation } = JSON.parse(event.body);
        const userId = event.requestContext.authorizer.principalId;

        if (!enterpriseId || enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (!status || status === undefined || !isValidEnterpriseStatus(status)) throw new BadRequestException('SCF.LIBERA.39', { status });

        await EnterpriseService.updateEnterpriseStatusById(+enterpriseId, status, userId, explanation);
        console.log(`HANDLER: Ending ${context.functionName} method...`);
        return Res.NoContent();

    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.READ_ENTERPRISE_DOCUMENTATION,
            PermissionEnum.APPROVE_DOCUMENTS,
            PermissionEnum.REQUEST_DOCUMENTS,
            PermissionEnum.UPDATE_DOCUMENTS,
            PermissionEnum.DELETE_DOCUMENTS,
            PermissionEnum.UPLOAD_DOCUMENTS
        ]
    }));