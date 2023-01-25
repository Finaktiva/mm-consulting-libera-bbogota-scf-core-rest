const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { SimpleFilter } from 'commons/filter';
import { EnterpriseInvoiceService } from 'services/enterprise-invoice.service';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName} method`);
    try {
        if(!event.pathParameters) throw new BadRequestException('SCF.LIBERA.126');

        const enterpriseId = event.pathParameters['enterpriseId'] != null ? parseInt(event.pathParameters['enterpriseId']) : null;
        const page = event.queryStringParameters['page'] != null ? parseInt(event.queryStringParameters['page']) : null;
        const perPage = event.queryStringParameters['per_page'] ? parseInt(event.queryStringParameters['per_page']) : null;

        if(!page)
            throw new BadRequestException('SCF.LIBERA.12');

        if(!perPage)
            throw new BadRequestException('SCF.LIBERA.12');

        if(!enterpriseId)
            throw new BadRequestException('SCF.LIBERA.29');
        console.log(`HANDLER: Starting ${context.functionName} method`);
        const filter = new SimpleFilter(page, perPage);
        const result = await EnterpriseInvoiceService.getEnterpriseInvoiceBulk(enterpriseId, filter);
        return Response.Ok(result.items, {'X-Total-Count': result.total});
    }
    catch(errors) {
        console.log('ERRORS: ', errors);
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