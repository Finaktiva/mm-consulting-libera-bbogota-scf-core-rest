import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { ProviderService } from 'services/provider.service';
import { parseNegotiationUpdateProcessStatus } from 'commons/enums/enterprise-invoice-negotiation-process-status.enum';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    try {
        if (!event.pathParameters) throw new BadRequestException('SCF.LIBERA.COMMON.400');
        const { enterpriseId, invoiceId, negotiationId } = event.pathParameters;
        const { status, newOffer } = JSON.parse(event.body);
        const userId = +event.requestContext.authorizer['principalId'];

        if (!enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (!invoiceId || invoiceId === undefined) throw new BadRequestException('SCF.LIBERA.124');
        if (isNaN(+invoiceId)) throw new BadRequestException('SCF.LIBERA.125', { invoiceId });
        if (!negotiationId || negotiationId == undefined) throw new BadRequestException('SCF.LIBERA.143');
        if (isNaN(+negotiationId)) throw new BadRequestException('SCF.LIBERA.146', {negotiationId});
        if(status && !parseNegotiationUpdateProcessStatus(status))
            throw new BadRequestException('SCF.LIBERA.39', {status});

        await ProviderService.updateInvoiceNegotiationById(+enterpriseId, +invoiceId, +negotiationId, {status, newOffer}, +userId);
        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.NoContent();
    }
    catch (errors) {
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