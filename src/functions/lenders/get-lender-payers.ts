import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda'
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import { parseLenderPayersFilterBy, BasicFilter, LenderPayersFilterBy } from 'commons/filter';
import { parseEnterpriseType } from 'commons/enums/enterprise-type-enum';
import { EnterpriseFundingLinkService } from 'services/enterprise-funding-link.service';
const middy = require('middy');
import Response from 'commons/response';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName} method`);
    try {
        if(!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.12');

        const lenderId = event.pathParameters['enterpriseId'] ? parseInt(event.pathParameters['enterpriseId']) : null;
        const page = event.queryStringParameters['page'] ? parseInt(event.queryStringParameters['page']) : null;
        const perPage = event.queryStringParameters['per_page'] ? parseInt(event.queryStringParameters['per_page']) : null;
        const filterBy = event.queryStringParameters['filter_by'] ? parseLenderPayersFilterBy(event.queryStringParameters['filter_by']) : 'NONE';
        let q = event.queryStringParameters['q'] ? event.queryStringParameters['q'] : null;

        if(!lenderId)
            throw new BadRequestException('SCF.LIBERA.29');

        if(!page)
            throw new BadRequestException('SCF.LIBERA.183');

        if(!perPage)
            throw new BadRequestException('SCF.LIBERA.184');
        
        console.log('filterBy', filterBy);
        if((filterBy != 'NONE' && !q) || (filterBy == 'NONE' && q))
            throw new BadRequestException('SCF.LIBERA.185');

        if(filterBy == 'INVALID')
            throw new BadRequestException('SCF.LIBERA.186', { filterBy: event.queryStringParameters['filter_by'] });

        
        if(filterBy == 'ENTERPRISE_TYPE' && !parseEnterpriseType(q))
            throw new BadRequestException('SCF.LIBERA.145', { q });
        
        if(filterBy == 'ENTERPRISE_TYPE')
            q = parseEnterpriseType(q);

        const filter: BasicFilter<LenderPayersFilterBy, string> = {
            page,
            perPage,
            filterBy,
            q
        };

        const enterprisePayersPage = await EnterpriseFundingLinkService.getEnterprisePayersByLender(lenderId, filter);
        console.log(`HANDLER: Ending ${context.functionName} method`);
        return Response.Ok(enterprisePayersPage.enterprisePayers, { 'X-Total-Count': enterprisePayersPage.totalEnterprisePayers });
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
            RoleEnum.ENTERPRISE_FUNDING_ADMIN
        ]
    }));