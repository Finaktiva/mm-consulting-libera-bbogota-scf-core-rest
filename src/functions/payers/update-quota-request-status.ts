import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
const middy = require('middy');
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { handleException, BadRequestException } from 'commons/exceptions';
import { parseUpdateEnterpriseQuotaRequestStatus, parseEnterpriseQuotaRequestStatus } from 'commons/enums/enterprise-quota-request-status.enum';
import { EnterpriseQuotaRequestService } from 'services/enterprise-quota-request.service';
import Response from 'commons/response';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName} method`);
    try {
        const payerId = event.pathParameters['enterpriseId'] ? parseInt(event.pathParameters['enterpriseId']) : null;
        const quotaRequestId = event.pathParameters['quotaRequestId'] ? parseInt(event.pathParameters['quotaRequestId']) : null;
        let { status } = JSON.parse(event.body);

        if(!payerId)
            throw new BadRequestException('SCF.LIBERA.29');

        if(!quotaRequestId)
            throw new BadRequestException('SCF.LIBERA.190');
        
        if(!parseUpdateEnterpriseQuotaRequestStatus(status))
            throw new BadRequestException('SCF.LIBERA.191', { status });
        
        
        const userId = event.requestContext.authorizer.principalId;
         
        status = parseEnterpriseQuotaRequestStatus(status);
        await EnterpriseQuotaRequestService.updateQuotaRequestStatus(payerId, quotaRequestId, status, userId);
        console.log(`HANDLER: Ending ${context.functionName} method`);
        return Response.NoContent();
    }
    catch(errors) {
        console.log('HANLDER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN,
            RoleEnum.ENTERPRISE_PAYER_ADMIN
        ]
    }))