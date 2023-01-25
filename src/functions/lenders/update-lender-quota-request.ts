import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
const middy = require('middy');
import Response from 'commons/response';
import { BadRequestException, handleException } from 'commons/exceptions';
import { EnterpriseQuotaRequestService } from 'services/enterprise-quota-request.service';
import { ILenderUpdateQuotaRequest } from 'commons/interfaces/lender-update-quota-request.interface';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName} method`);
    try {
        const lenderId = event.pathParameters['enterpriseId'] ? parseInt(event.pathParameters['enterpriseId']) : null;
        const quotaRequestId = event.pathParameters['requestId'] ? parseInt(event.pathParameters['requestId']) : null;
        const requestBody = JSON.parse(event.body);
        const userId = event.requestContext.authorizer.principalId;

        if(!lenderId)
            throw new BadRequestException('SCF.LIBERA.29');

        if(!quotaRequestId)
            throw new BadRequestException('SCF.LIBERA.190');

        if(!requestBody.grantedQuota)
            throw new BadRequestException('SCF.LIBERA.197');

        if(isNaN(requestBody.rate))
            throw new BadRequestException('SCF.LIBERA.268');

        const lenderUpdateQuotaRequest: ILenderUpdateQuotaRequest = {
            comments: requestBody.comments,
            grantedQuota: requestBody.grantedQuota,
            rate: parseFloat(requestBody.rate),
            rateType: requestBody.rateType,
            userId
        }
        await EnterpriseQuotaRequestService.updateLenderQuotaRequest(lenderId, quotaRequestId, lenderUpdateQuotaRequest);
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
            RoleEnum.ENTERPRISE_FUNDING_ADMIN
        ]
    }));