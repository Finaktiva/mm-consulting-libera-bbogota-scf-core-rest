const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { BadRequestException, handleException } from 'commons/exceptions';
import { parseFilterLendersAvaiable } from 'commons/enums/filter-by.enum';
import Response from 'commons/response';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { IFilterLenders } from 'commons/interfaces/query-filters.interface';
import { EnterpriseService } from 'services/enterprise.service';

export const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        if (!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.17');
        const { page, per_page, filter_by, q } = event.queryStringParameters;
        if (!page || !per_page) throw new BadRequestException('SCF.LIBERA.12');
        if (isNaN(+page) || isNaN(+per_page)) throw new BadRequestException('SCF.LIBERA.59');
        if (+page < 1 || +per_page < 1) throw new BadRequestException('SCF.LIBERA.78');
        if (filter_by && !parseFilterLendersAvaiable(filter_by)) throw new BadRequestException('SCF.LIBERA.116', { filter_by: filter_by });
        if(filter_by && !q) throw new BadRequestException('SCF.LIBERA.15');
        const userId = +event.requestContext.authorizer['principalId'];
        
        const filter: IFilterLenders = {
            page: +page,
            perPage: +per_page,
            filterBy: filter_by ? parseFilterLendersAvaiable(filter_by) : null,
            q: q ? q : null
        }
        const lenders = await EnterpriseService.getLendersAvaiable(filter, +userId);

        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.Ok(lenders, { 'X-Total-Count': lenders.total });
    }
    catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }

}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_PAYER_ADMIN,
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN
        ]
    }));