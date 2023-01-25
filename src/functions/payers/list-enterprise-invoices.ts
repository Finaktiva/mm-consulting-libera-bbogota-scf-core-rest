const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { isFilterEnterpriseInvoiceValid } from 'commons/enums/filter-by.enum';
import { parseFilterEnterpriseInvoiceStatus } from 'commons/enums/filter-status.enum';
import { FilterEnterprises } from 'commons/filter';
import { EnterpriseService } from 'services/enterprise.service';
import Response from 'commons/response';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        if (!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.12');
        const { enterpriseId } = event.pathParameters;
        if (!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        const { page, per_page, filter_by, q, status } = event.queryStringParameters;
        if (!page || !per_page)
            throw new BadRequestException('SCF.LIBERA.12');
        if (isNaN(+page) || isNaN(+per_page))
            throw new BadRequestException('SCF.LIBERA.59');
        if (+page <= 0 || +per_page <= 0)
            throw new BadRequestException('SCF.LIBERA.78');
        if (+per_page > 25) throw new BadRequestException('SCF.LIBERA.18');
        if (filter_by && !q) throw new BadRequestException('SCF.LIBERA.15');
        if (filter_by && !isFilterEnterpriseInvoiceValid(filter_by))
            throw new BadRequestException('SCF.LIBERA.116', { filter_by });
        if (status && !parseFilterEnterpriseInvoiceStatus(status))
            throw new BadRequestException('SCF.LIBERA.39', { status });

        const filter = new FilterEnterprises(+page, +per_page, filter_by, parseFilterEnterpriseInvoiceStatus(status), q);
        const invoices = await EnterpriseService.getEnterpriseInvoices(+enterpriseId, filter);
        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.Ok(invoices.list, { 'X-Total-Count': invoices.total })
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({ roles: [RoleEnum.ENTERPRISE_CONSOLE_ADMIN, RoleEnum.ENTERPRISE_PAYER_ADMIN] }));