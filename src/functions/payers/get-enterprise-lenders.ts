import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { handleException, BadRequestException } from 'commons/exceptions';
const middy = require('middy');
import Response from 'commons/response';
import { EnterpriseFundingLinkService } from 'services/enterprise-funding-link.service';
import { BasicFilter, EnterpriseQuotaRequestFilterBy, EnterpriseQuotaRequestOrderBy, parseEnterpriseQuotaRequestFilterBy, parseEnterpriseQuotaRequestOrderBy } from 'commons/filter';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName} method`);
    try{
        
        if(!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.12');
        
        const payerId = event.pathParameters['enterpriseId'] ? parseInt(event.pathParameters['enterpriseId']) : null;
        const page = event.queryStringParameters['page'] ? parseInt(event.queryStringParameters['page']) : null;
        const perPage = event.queryStringParameters['per_page'] ? parseInt(event.queryStringParameters['per_page']) : null;
        const filterBy = event.queryStringParameters['filter_by'] ? parseEnterpriseQuotaRequestFilterBy(event.queryStringParameters['filter_by']) : 'NONE';
        let q = event.queryStringParameters['q'] ? event.queryStringParameters['q'] : null;
        const orderBy = event.queryStringParameters['order_by'] ? parseEnterpriseQuotaRequestOrderBy(event.queryStringParameters['order_by']) : 'NONE';

        if(!payerId)
            throw new BadRequestException('SCF.LIBERA.29');

        console.log('page', page);
        if(!page)
            throw new BadRequestException('SCF.LIBERA.183');

        console.log('perPage', perPage);
        if(!perPage)
            throw new BadRequestException('SCF.LIBERA.184');
            
        console.log('filterBy', filterBy);
        if((filterBy != 'NONE' && !q) || (filterBy == 'NONE' && q))
            throw new BadRequestException('SCF.LIBERA.185');

        const filter: BasicFilter<EnterpriseQuotaRequestFilterBy, EnterpriseQuotaRequestOrderBy> = {
            filterBy,
            page,
            perPage,
            q,
            orderBy
        }
        const lendersPage = await EnterpriseFundingLinkService.getEnterpriseLendersByPayer(payerId, filter);
        console.log(`HANDLER: Ending ${context.functionName} method`);
        return Response.Ok(lendersPage.lenderQuotaRequests, { 'X-Total-Count': lendersPage.totalEnterpriseLenders });
    }
    catch(errors) {
        console.log('HANLDER ERRORS: ', errors);
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