const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import Response from 'commons/response';
import { BadRequestException, handleException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { EnterpriseService } from 'services/enterprise.service';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);
    try {
        if(!event.pathParameters) throw new BadRequestException('SCF.LIBERA.COMMON.400');
        const { enterpriseId, userId } = event.pathParameters;
        if(!enterpriseId || enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.29');
        if(!userId || userId === undefined || isNaN(+userId)) throw new BadRequestException('SCF.LIBERA.57');
        await EnterpriseService.deleteUserById(+enterpriseId, +userId);
        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.NoContent();
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN
        ]
    }));