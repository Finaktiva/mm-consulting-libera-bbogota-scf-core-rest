import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import Response from 'commons/response';
import { EnterpriseService } from 'services/enterprise.service';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        const { attributeId, enterpriseId } = event.pathParameters;

        if (!attributeId) throw new BadRequestException('SCF.LIBERA.113', { attributeId });
        if (attributeId === undefined || isNaN(+attributeId)) throw new BadRequestException('SCF.LIBERA.114', { attributeId });
        if (!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        if (enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });

        await EnterpriseService.deleteEnterpriseCustomAttribute(+attributeId, +enterpriseId);
        console.log(`HANDLER: Ending ${context.functionName}`);
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
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN,
            RoleEnum.ENTERPRISE_PAYER_ADMIN
        ]
    }));