import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { EnterpriseInvoiceFundingProcessService } from 'services/enterprise-invoice-funding-process.service';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    try {
        if (!event.pathParameters) throw new BadRequestException('SCF.LIBERA.COMMON.400');
        const { enterpriseId, invoiceId } = event.pathParameters;

        if (!enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (!invoiceId || invoiceId === undefined) throw new BadRequestException('SCF.LIBERA.124');
        if (isNaN(+invoiceId)) throw new BadRequestException('SCF.LIBERA.125', { invoiceId });

        const response = await EnterpriseInvoiceFundingProcessService.getLenderFundingRequestsDetails(+enterpriseId, +invoiceId);
        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Ok(response);
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
            RoleEnum.ENTERPRISE_FUNDING_ADMIN
        ]
    }));