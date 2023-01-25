import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { parseUpdateEnterpriseQuotaRequestStatus } from 'commons/enums/enterprise-quota-request-status.enum';
import { EnterpriseQuotaRequestService } from 'services/enterprise-quota-request.service';

const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    try {
        if (!event.pathParameters) throw new BadRequestException('SCF.LIBERA.COMMON.400');
        const { enterpriseId, requestId } = event.pathParameters;
        const { status } = JSON.parse(event.body);
        const userId = event.requestContext.authorizer.principalId;

        if (!enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (!requestId || requestId === undefined) throw new BadRequestException('SCF.LIBERA.80');
        if (isNaN(+requestId)) throw new BadRequestException('SCF.LIBERA.81', { requestId });
        if (status && !parseUpdateEnterpriseQuotaRequestStatus(status))
            throw new BadRequestException('SCF.LIBERA.191', { status });

        await EnterpriseQuotaRequestService.updateQuotaRequestStatusByLenderId(+enterpriseId, +requestId, status, +userId);

        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.NoContent();

    } catch (errors) {
        console.log('HANDLER ERROR: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN,
            RoleEnum.ENTERPRISE_FUNDING_ADMIN
        ]
    }));