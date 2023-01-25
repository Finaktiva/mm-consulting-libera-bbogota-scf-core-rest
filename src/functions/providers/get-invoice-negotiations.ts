import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { EnterpriseInvoiceService } from "services/enterprise-invoice.service";
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';

const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context : Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    const { enterpriseId, invoiceId } = event.pathParameters;
    const orderBy = event.queryStringParameters && event.queryStringParameters['order_by'] ? event.queryStringParameters['order_by'].toUpperCase() : 'DESC';
    const size = event.queryStringParameters && event.queryStringParameters['size'] ? event.queryStringParameters['size'] : null;

    try {
        if(isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50',{ enterpriseId });
        if(isNaN(+invoiceId)) throw new BadRequestException('SCF.LIBERA.125',{ invoiceId });
        if(orderBy != 'ASC' && orderBy != 'DESC') throw new BadRequestException('SCF.LIBERA.141', { order_by: orderBy });
        if(size && isNaN(+size) || +size < 0) throw new BadRequestException('SCF.LIBERA.142',{ size });

        const result = await EnterpriseInvoiceService.getProviderInvoiceNegotiations(+enterpriseId, +invoiceId, { orderBy, size });

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
            RoleEnum.ENTERPRISE_PROVIDER_ADMIN
        ]
    }));