import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { EnterpriseInvoiceService } from "services/enterprise-invoice.service";
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { parseFilterLastInvoiceNegotiation, FilterLastInvoiceNegotiationEnum } from 'commons/enums/filter-by.enum';
import LiberaUtils from 'commons/libera.utils';
import { RoleEnum } from 'commons/enums/role.enum';

const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context : Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    const { enterpriseId } = event.pathParameters;
    const page = event.queryStringParameters && event.queryStringParameters['page'] ? event.queryStringParameters['page'] : null;
    const perPage = event.queryStringParameters && event.queryStringParameters['per_page'] ? event.queryStringParameters['per_page']: null;
    const filterBy = event.queryStringParameters && event.queryStringParameters['filter_by'] ? event.queryStringParameters['filter_by'] : null;
    const q = event.queryStringParameters && event.queryStringParameters['q'] ? event.queryStringParameters['q'] : null;

    try {
        if (!enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (!page || !perPage) throw new BadRequestException('SCF.LIBERA.12');
        if (isNaN(+page) || isNaN(+perPage)) throw new BadRequestException('SCF.LIBERA.59');
        if (+page < 1 || +perPage < 1) throw new BadRequestException('SCF.LIBERA.78');
        if (+perPage > 25) throw new BadRequestException('SCF.LIBERA.108');
        if (filterBy && !parseFilterLastInvoiceNegotiation(filterBy)) throw new BadRequestException('SCF.LIBERA.116', { filter_by: filterBy });
        if (filterBy && !q) throw new BadRequestException('SCF.LIBERA.15');
        if (filterBy && (filterBy == FilterLastInvoiceNegotiationEnum.startingDate || filterBy == FilterLastInvoiceNegotiationEnum.effectivePaymentDate
            || filterBy == FilterLastInvoiceNegotiationEnum.discountDueDate) && !LiberaUtils.isValidFormatDate(q)) throw new BadRequestException('SCF.LIBERA.41', { date: q });
        if (filterBy && (filterBy == FilterLastInvoiceNegotiationEnum.discountPercentage || filterBy == FilterLastInvoiceNegotiationEnum.discountValue)
            && isNaN(+q)) throw new BadRequestException('SCF.LIBERA.145', { q });

        const result = await EnterpriseInvoiceService.getAllProviderNegotiations(+enterpriseId, { page, perPage, filterBy, q });

        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Ok(result.invoiceNegotiations, { 'X-Total-Count': result.total });
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