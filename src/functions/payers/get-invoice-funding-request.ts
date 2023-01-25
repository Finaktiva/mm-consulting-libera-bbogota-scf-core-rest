import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { PayerService } from 'services/payer.service';
import { parseOrderBy } from 'commons/enums/order-by.enum';

const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {    
        const enterpriseId = event.pathParameters['enterpriseId'] ? +event.pathParameters['enterpriseId'] : null;
        const invoiceId = event.pathParameters['invoiceId'] ? +event.pathParameters['invoiceId'] : null;
        const order_by = event.queryStringParameters && event.queryStringParameters['order_by'] ? event.queryStringParameters['order_by'].toUpperCase() : 'DESC';
        const size = event.queryStringParameters && event.queryStringParameters['size'] ? +event.queryStringParameters['size'] : null;
        
        if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.159');
        if(!invoiceId) throw new BadRequestException('SCF.LIBERA.160');
        if(isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50',{ enterpriseId });
        if(isNaN(+invoiceId)) throw new BadRequestException('SCF.LIBERA.125',{ invoiceId });
        if(!parseOrderBy(order_by)) throw new BadRequestException('SCF.LIBERA.141', { order_by });
        if(size && isNaN(+size) || +size < 0) throw new BadRequestException('SCF.LIBERA.142',{ size });
        const orderBy = parseOrderBy(order_by);
        
        const result = await PayerService.getInvoiceFundingRequest(enterpriseId, invoiceId, { orderBy, size });

        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Ok(result.invoiceFundingProcess, { 'X-Total-Count': result.total });
    }
    catch (error) {
        console.log('ERRORS: ' , error);
        return handleException(error);
    }
};

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN,
            RoleEnum.ENTERPRISE_PAYER_ADMIN
        ]
    }));