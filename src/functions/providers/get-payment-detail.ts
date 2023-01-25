const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { EnterpriseInvoiceService } from 'services/enterprise-invoice.service';
import { EnterpriseInvoiceFundingProcessService } from 'services/enterprise-invoice-funding-process.service';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`Handler: Starting ${context.functionName} `);
    try {
        console.log(`Handler: Starting ${context.functionName} `);
        const { enterpriseId, invoiceId } = event.pathParameters;

        if (!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        if (enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });

        if (!invoiceId) throw new BadRequestException('SCF.LIBERA.160');
        if (invoiceId === undefined || isNaN(+invoiceId)) throw new BadRequestException('SCF.LIBERA.125', { invoiceId });

        const paymentDetail = await EnterpriseInvoiceFundingProcessService.getPaymentDetail(+enterpriseId, +invoiceId);

        console.log(`Handler: Ending ${context.functionName} `);
        return Response.Ok(paymentDetail);
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
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