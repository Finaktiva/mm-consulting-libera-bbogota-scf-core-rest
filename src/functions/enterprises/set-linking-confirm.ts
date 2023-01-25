const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { isValidStatus } from 'commons/enums/enterprise-request-status.enum';
import { EnterpriseLinkService } from 'services/enterprise-link.service';


export const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    try {
        
        if (!event.pathParameters) throw new BadRequestException('SCF.LIBERA.COMMON.400');
        if (!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.17');
        const { enterpriseId } = event.pathParameters;
        const { reply } = JSON.parse(event.body);
        const { token } = event.queryStringParameters;

        if (!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        if (enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId })
        if (!token) throw new BadRequestException('SCF.LIBERA.101');
        if (!event.body) throw new BadRequestException('SCF.LIBERA.49');
        if (reply && !isValidStatus(reply)) throw new BadRequestException('SCF.LIBERA.102', {reply});

        await EnterpriseLinkService.setLinkingConfirm(+enterpriseId, reply, token);

        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.NoContent();
    }
    catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}
export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_PROVIDER_ADMIN,
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN,
            RoleEnum.ENTERPRISE_FUNDING_ADMIN,
            RoleEnum.ENTERPRISE_PAYER_ADMIN
        ]
    }));
