import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { handleException, BadRequestException } from 'commons/exceptions';
import { EnterpriseFundingLinkService } from 'services/enterprise-funding-link.service';
import Response from 'commons/response';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName} method`);
    try {
        const lenderId = event.pathParameters['enterpriseId'] ? parseInt(event.pathParameters['enterpriseId']) : null;
        const payerId = event.pathParameters['payerId'] ? parseInt(event.pathParameters['payerId']) : null;

        if(!lenderId)
            throw new BadRequestException('SCF.LIBERA.198');

        if(!payerId)
            throw new BadRequestException('SCF.LIBERA.213');
        
        const fundingLinkPayer = await EnterpriseFundingLinkService.getPayerByLenderIdAndPayerId(lenderId, payerId);
        console.log(`HANDLER: Ending ${context.functionName} method`);
        return Response.Ok(fundingLinkPayer);
    }
    catch(errors) {
        console.log('HANDLER ERRORS: ', errors);
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