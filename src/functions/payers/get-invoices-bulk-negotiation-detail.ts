import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { EnterpriseInvoiceNegotiationService } from 'services/enterprise-invoice-negotiation.service';

const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context : Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    const { enterpriseId, bulkNegotiationId } = event.pathParameters;
    try {
        if(isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50',{ enterpriseId });
        if(isNaN(+bulkNegotiationId)) throw new BadRequestException('SCF.LIBERA.125',{ bulkNegotiationId });

        const result = await EnterpriseInvoiceNegotiationService.getInvoiceBulkNegotiation(+enterpriseId, +bulkNegotiationId);

        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Ok(result);
    }
    catch(error) {
        console.log('HANDLER ERROR: ', error);
        return handleException(error);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN,
            RoleEnum.ENTERPRISE_PAYER_ADMIN
        ]
    }));