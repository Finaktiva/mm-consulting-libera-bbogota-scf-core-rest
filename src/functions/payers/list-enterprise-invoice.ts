import { APIGatewayProxyHandler, APIGatewayEvent, Context } from "aws-lambda";
import { BadRequestException, handleException } from "commons/exceptions";
import { EnterpriseInvoiceService } from "services/enterprise-invoice.service";
import Res from "commons/response";
import { authorizerRoles } from "commons/middlewares/authorizer-roles";
import { RoleEnum } from "commons/enums/role.enum";
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`Handler: Starting ${context.functionName} `);
    const { enterpriseId, invoiceId } = event.pathParameters;

    try {
        if (!enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (!invoiceId || invoiceId === undefined) throw new BadRequestException('SCF.LIBERA.124');
        if (isNaN(+invoiceId)) throw new BadRequestException('SCF.LIBERA.125', { invoiceId });

        console.log('invoiceId: ',invoiceId);
        console.log('enterprise: ', enterpriseId);
        const invoice = await EnterpriseInvoiceService.getInvoiceById(+enterpriseId, +invoiceId);

        console.log(`Handler: Ending ${context.functionName} `);
        return Res.Ok(invoice);
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