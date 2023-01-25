import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { EnterpriseInvoiceNegotiationService } from 'services/enterprise-invoice-negotiation.service';
import { parseFilterBulkNegotiation } from 'commons/enums/filter-by.enum';
import { IFilterBasic } from 'commons/interfaces/query-filters.interface';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    try {
        if (!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.17');

        const { enterpriseId } = event.pathParameters;
        const { page, per_page, filter_by, q } = event.queryStringParameters;

        if (!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        if (!page || !per_page) throw new BadRequestException('SCF.LIBERA.12');
        if (filter_by && !q) throw new BadRequestException('SCF.LIBERA.15');

        console.log(`enterpriseId received >>>>> ${enterpriseId} `);
        console.log(`page received >>>>> ${page} `);
        console.log(`per_page received >>>>> ${per_page} `);
        console.log(`q received >>>>> ${q} `);

        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (isNaN(+page) || isNaN(+per_page)) throw new BadRequestException('SCF.LIBERA.59');
        if (+page < 1 || +per_page < 1) throw new BadRequestException('SCF.LIBERA.78');
        if (filter_by && !parseFilterBulkNegotiation(filter_by))
            throw new BadRequestException('SCF.LIBERA.116', { filter_by });
        
        const filter: IFilterBasic = {
            page: +page,
            perPage: +per_page,
            filterBy: filter_by ? parseFilterBulkNegotiation(filter_by) : null,
            q: q ? q : null
        }

        const negotiations = await EnterpriseInvoiceNegotiationService.getProviderBulkInvoiceNegotiations(
            +enterpriseId, filter);

        console.log(`HANDLER: Ending ${context.functionName}...`);

        return Response.Ok(negotiations.result, {'X-Total-Count': negotiations.total})
    } catch (error) {
        console.log('HANDLER ERROR: ', error);
        return handleException(error);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_PROVIDER_ADMIN
        ]
    }));