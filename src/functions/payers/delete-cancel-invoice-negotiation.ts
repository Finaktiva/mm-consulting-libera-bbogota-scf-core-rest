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
        const { negotiationId, enterpriseId, invoiceId } = event.pathParameters;
        
        const userId = +event.requestContext.authorizer['principalId'];

        if (!negotiationId) throw new BadRequestException('SCF.LIBERA.143');
        if (negotiationId === undefined || isNaN(+negotiationId)) throw new BadRequestException('SCF.LIBERA.146', { negotiationId });
        if (!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        if (enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (!invoiceId) throw new BadRequestException('SCF.LIBERA.124');
        if (invoiceId === undefined || isNaN(+invoiceId)) throw new BadRequestException('SCF.LIBERA.125', { invoiceId });

        await EnterpriseService.cancelInvoiceNegotiation(+negotiationId, +enterpriseId, +invoiceId, +userId);
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