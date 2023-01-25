const middy = require('middy');
import { APIGatewayProxyEvent, APIGatewayProxyHandler, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { TemporalTokenService } from 'services/token.service';
import Response from 'commons/response';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';

const originalHandler : APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        if(!event.queryStringParameters)
            throw new BadRequestException('SCF.LIBERA.101');
        const { token } = event.queryStringParameters;
        const { enterpriseId } = event.pathParameters;
        if(!enterpriseId)
            throw new BadRequestException('SCF.LIBERA.29');
        const result = await TemporalTokenService.verification(+enterpriseId, token);
        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.Ok(result);
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_PROVIDER_ADMIN,
            RoleEnum.ENTERPRISE_PAYER_ADMIN,
            RoleEnum.ENTERPRISE_FUNDING_ADMIN,
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN
        ]
    }));