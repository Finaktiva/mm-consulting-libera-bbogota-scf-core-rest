import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from "aws-lambda";
import { authorizerRoles } from "commons/middlewares/authorizer-roles";
import { RoleEnum } from "commons/enums/role.enum";
import { handleException, BadRequestException } from "commons/exceptions";
import Response from 'commons/response';
import { EnterpriseInvoiceFundingProcessService } from "services/enterprise-invoice-funding-process.service";

const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    
    const enterpriseId = event.pathParameters['enterpriseId'] ? event.pathParameters['enterpriseId'] : null;
    const invoiceId = event.pathParameters['invoiceId'] ? event.pathParameters['invoiceId'] : null;
    const requestId = event.pathParameters['requestId'] ? event.pathParameters['requestId'] : null;

    try {
        if(!enterpriseId)
            throw new BadRequestException('SCF.LIBERA.159');
        if(isNaN(+enterpriseId))
            throw new BadRequestException('SCF.LIBERA.50',{ enterpriseId });
        if(!invoiceId)
            throw new BadRequestException('SCF.LIBERA.160');
        if(isNaN(+invoiceId))
            throw new BadRequestException('SCF.LIBERA.125',{ invoiceId });
        if(!requestId)
            throw new BadRequestException('SCF.LIBERA.80');
        if(isNaN(+requestId))
            throw new BadRequestException('SCF.LIBERA.81',{ requestId });

        const result = await EnterpriseInvoiceFundingProcessService.getInvoiceFundingRecord(+enterpriseId, +invoiceId, +requestId);
        
        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Ok(result.record, { 'X-Total-Count': result.total });
    } catch (error) {
        console.log('ERRORS: ' , error);
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