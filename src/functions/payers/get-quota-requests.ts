import { APIGatewayProxyHandler,  APIGatewayProxyEvent, Context } from 'aws-lambda';
const middy = require('middy');
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { handleException, BadRequestException, LiberaException } from 'commons/exceptions';
import { BasicFilter, QuotaRequestFilterBy, parseQuotaRequestFilterBy } from 'commons/filter';
import { EnterpriseQuotaRequestService } from 'services/enterprise-quota-request.service';
import Response from 'commons/response';
import { parseEnterpriseQuotaRequestStatus } from 'commons/enums/enterprise-quota-request-status.enum';


const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName} method`);
    try {
        if(!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.12');

        const enterpriseId = event.pathParameters['enterpriseId'] ? parseInt(event.pathParameters['enterpriseId']) : null;
        const page = event.queryStringParameters['page'] ? parseInt(event.queryStringParameters['page']) : null;
        const perPage = event.queryStringParameters['per_page'] ? parseInt(event.queryStringParameters['per_page']) : null;
        const filterBy = parseQuotaRequestFilterBy(event.queryStringParameters['filter_by']);
        let q = event.queryStringParameters['q'];

        console.log('enterpriseId', enterpriseId);
        if(!enterpriseId)
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
        
        if(filterBy == 'STATUS' && !parseEnterpriseQuotaRequestStatus(q))
            throw new BadRequestException('SCF.LIBERA.145', { q });

        if(filterBy == 'INVALID')
            throw new BadRequestException('SCF.LIBERA.186', { filterBy: event.queryStringParameters['filter_by'] });

        if(filterBy == 'STATUS' && parseEnterpriseQuotaRequestStatus(q))
            q = parseEnterpriseQuotaRequestStatus(q);

        console.log(q);
        const filter = new BasicFilter<QuotaRequestFilterBy, string>(page, perPage, filterBy, q);
        console.log(`HANDLER: Ending ${context.functionName} method`);
        const quotaRequestPage = await EnterpriseQuotaRequestService.getQuotaRequests(enterpriseId, filter);
        return Response.Ok(quotaRequestPage.quotaRequests, { 'X-Total-Count': quotaRequestPage.totalQuotaRequests });
    }
    catch(errors) {
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