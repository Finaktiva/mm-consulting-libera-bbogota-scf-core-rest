import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { FilterFundingRequestEnum, parseFilterFundingRequest } from 'commons/enums/filter-by.enum';
import LiberaUtils from 'commons/libera.utils';
import { RoleEnum } from 'commons/enums/role.enum';
import { isFilterFundingProcessStatusValid } from 'commons/enums/enterprise-invoice-funding-process-status.enum';
import { EnterpriseInvoiceFundingProcessService } from 'services/enterprise-invoice-funding-process.service';
import { IFilterFundingRequest } from 'commons/interfaces/query-filters.interface';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    const { enterpriseId } = event.pathParameters;
    const page = event.queryStringParameters && event.queryStringParameters['page'] ? event.queryStringParameters['page'] : null;
    const perPage = event.queryStringParameters && event.queryStringParameters['per_page'] ? event.queryStringParameters['per_page'] : null;
    const filterBy = event.queryStringParameters && event.queryStringParameters['filter_by'] ? event.queryStringParameters['filter_by'] : null;
    const q = event.queryStringParameters && event.queryStringParameters['q'] ? event.queryStringParameters['q'] : null;

    try {
        if (!enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (!page || !perPage) throw new BadRequestException('SCF.LIBERA.12');
        if (isNaN(+page) || isNaN(+perPage)) throw new BadRequestException('SCF.LIBERA.59');
        if (+page < 1 || +perPage < 1) throw new BadRequestException('SCF.LIBERA.78');
        if (filterBy && !parseFilterFundingRequest(filterBy)) throw new BadRequestException('SCF.LIBERA.116', { filter_by: filterBy });
        if (filterBy && !q) throw new BadRequestException('SCF.LIBERA.15');
        if (filterBy && (filterBy == FilterFundingRequestEnum.EFFECTIVEPAYMENTDATE || filterBy == FilterFundingRequestEnum.EXPECTEDPAYMENTDATE)
            && !LiberaUtils.isValidFormatDate(q)) throw new BadRequestException('SCF.LIBERA.41', { date: q });
        if (filterBy && filterBy === FilterFundingRequestEnum.STATUS && q && !isFilterFundingProcessStatusValid(q))
            throw new BadRequestException('SCF.LIBERA.39', { status: q });
        
        const filterFundingRequest: IFilterFundingRequest = {
            page: +page,
            perPage: +perPage,
            filterBy: filterBy ? parseFilterFundingRequest(filterBy) : null,
            q: q ? q : null
        }
        const lenderListRequestFunds = await EnterpriseInvoiceFundingProcessService.getLenderListRequestFunds(+enterpriseId, filterFundingRequest);

        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Ok(lenderListRequestFunds.result, { 'X-Total-Count': lenderListRequestFunds.total });
    }
    catch (error) {
        console.log('HANDLER ERROR: ', error);
        return handleException(error);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN,
            RoleEnum.ENTERPRISE_FUNDING_ADMIN
        ]
    }));