const middy = require('middy')
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from "aws-lambda";
import { BadRequestException, handleException } from "commons/exceptions";
import { parseFilterBulkNegotiation, FilterBulkNegotiationEnum } from "commons/enums/filter-by.enum";
import { authorizerRoles } from "commons/middlewares/authorizer-roles";
import { RoleEnum } from "commons/enums/role.enum";
import { EnterpriseInvoiceNegotiationService } from "services/enterprise-invoice-negotiation.service";
import Response from "commons/response";
import { IFilterBasic } from "commons/interfaces/query-filters.interface";
import { isNotValidEnterpriseInvoiceBulkNegotiationStatusEnum } from "commons/enums/enterprise-invoice-bulk-negotiation-status.emun";
import LiberaUtils from "commons/libera.utils";

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`HANDLER Starting ${context.functionName}`);
    try {
        if (!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.17');
        const { enterpriseId } = event.pathParameters;
        if (!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        const { page, per_page, filter_by, q } = event.queryStringParameters;
        if (!page || !per_page) throw new BadRequestException('SCF.LIBERA.12');
        if (isNaN(+page) || isNaN(+per_page)) throw new BadRequestException('SCF.LIBERA.59');
        if (+page < 1 || +per_page < 1) throw new BadRequestException('SCF.LIBERA.78');
        if (filter_by && !parseFilterBulkNegotiation(filter_by)) throw new BadRequestException('SCF.LIBERA.116', { filter_by });
        if (filter_by && !q) throw new BadRequestException('SCF.LIBERA.15');
        if (filter_by === FilterBulkNegotiationEnum.STATUS && !isNotValidEnterpriseInvoiceBulkNegotiationStatusEnum(q))
            throw new BadRequestException('SCF.LIBERA.257', { q });
        if(filter_by === FilterBulkNegotiationEnum.CREATION_DATE && !LiberaUtils.isValidFormatDate(q)) 
            throw new BadRequestException('SCF.LIBERA.41', { date: q })
        const filter: IFilterBasic = {
            page: +page,
            perPage: +per_page,
            filterBy: filter_by ? parseFilterBulkNegotiation(filter_by) : null,
            q: q ? q : null
        }
        const negotiations = await EnterpriseInvoiceNegotiationService.getAllPayerBulkDiscountNegotiations(+enterpriseId, filter);
        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.Ok(negotiations.result, { 'X-Total-Count': negotiations.total })
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }

}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN,
            RoleEnum.ENTERPRISE_PAYER_ADMIN]
    }));