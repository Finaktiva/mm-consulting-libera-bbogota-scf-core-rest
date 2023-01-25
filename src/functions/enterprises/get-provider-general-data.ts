import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { ProviderService } from 'services/provider.service';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    try {
        if (!event.pathParameters) throw new BadRequestException('SCF.LIBERA.COMMON.400');
        const { enterpriseId, providerId } = event.pathParameters;

        if (!enterpriseId || enterpriseId === undefined || !providerId || providerId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if (isNaN(+enterpriseId) || isNaN(+providerId) ) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });

        const result = await ProviderService.getGeneralData(+enterpriseId, +providerId);
        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Ok(result);
    }
    catch (errors) {
        console.log('HANDLER ERROR: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_PAYER_ADMIN,
            RoleEnum.LIBERA_ADMIN
        ]
    }));
