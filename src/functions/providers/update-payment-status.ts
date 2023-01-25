import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { RoleEnum } from 'commons/enums/role.enum';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { BadRequestException, handleException } from 'commons/exceptions';
import { ProviderService } from 'services/provider.service';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    try {
        if (!event.pathParameters) throw new BadRequestException('SCF.LIBERA.COMMON.400');
        const { enterpriseId, invoiceId } = event.pathParameters;
        const { fundingRequestId } = JSON.parse(event.body);
        const userId = +event.requestContext.authorizer['principalId'];

        if (!enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (!invoiceId || invoiceId === undefined) throw new BadRequestException('SCF.LIBERA.124');
        if (isNaN(+invoiceId)) throw new BadRequestException('SCF.LIBERA.125', { invoiceId });
        if (!fundingRequestId || fundingRequestId === undefined) throw new BadRequestException('SCF.LIBERA.187', { fundingRequestId });
        if (isNaN(+fundingRequestId)) throw new BadRequestException('SCF.LIBERA.188', { fundingRequestId });

        await ProviderService.updatePaymentStatusById(+enterpriseId, +invoiceId, +fundingRequestId, +userId);

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
            RoleEnum.ENTERPRISE_PROVIDER_ADMIN
        ]
    }));