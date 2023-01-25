import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import Response from 'commons/response';
import { EnterpriseInvoiceNegotiationService } from 'services/enterprise-invoice-negotiation.service';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        const { bulkNegotiationId, enterpriseId } = event.pathParameters;
        
        const userId = +event.requestContext.authorizer['principalId'];

        if (!bulkNegotiationId) throw new BadRequestException('SCF.LIBERA.143');
        if (bulkNegotiationId === undefined || isNaN(+bulkNegotiationId)) throw new BadRequestException('SCF.LIBERA.146', { bulkNegotiationId });
        if (!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        if (enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        
        await EnterpriseInvoiceNegotiationService.cancelInvoiceBulkNegotiation(+bulkNegotiationId, +enterpriseId, +userId);
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