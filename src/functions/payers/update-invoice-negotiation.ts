const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { EnterpriseService } from 'services/enterprise.service';
import Response from 'commons/response';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { parseNegotiationUpdateProcessStatus } from 'commons/enums/enterprise-invoice-negotiation-process-status.enum';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);
    try {
        if(!event.body) throw new BadRequestException('SCF.LIBERA.49');
        const { enterpriseId, invoiceId, negotiationId } = event.pathParameters;
        const { status, newOffer } = JSON.parse(event.body);
        const userId = +event.requestContext.authorizer['principalId'];
        if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        if(!invoiceId) throw new BadRequestException('SCF.LIBERA.124');
        if(!negotiationId) throw new BadRequestException('SCF.LIBERA.143');
        if(!status) throw new BadRequestException('SCF.LIBERA.31');
        if(status && !parseNegotiationUpdateProcessStatus(status))
            throw new BadRequestException('SCF.LIBERA.39', {status});
        await EnterpriseService.updateInvoiceNegotiationById(+enterpriseId, +invoiceId, +negotiationId, {status, newOffer}, +userId);
        return Response.NoContent();
    } catch (errors) {
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