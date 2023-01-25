const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { EnterpriseService } from 'services/enterprise.service';
import { BadRequestException, handleException } from 'commons/exceptions';
import { FilterEnterpriseRequests } from 'commons/filter';
import { isEnterpriseRequestStatusValid } from 'commons/enums/enterprise-request-status.enum';
import Response from 'commons/response';
import { isEnterpriseRequestTypeValid } from 'commons/enums/enterprise-request-type.enum';
import { isEnterpriseLinkTypeValid } from 'commons/enums/enterprise-link-type.enum';
import { FilterEnterpriseRequestEnum, parseFilterEnterpriseRequest } from 'commons/enums/filter-by.enum';
import LiberaUtils from 'commons/libera.utils';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';

const originalHandler : APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {
        if(!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.17');
        const { page, per_page, request, filter_by, q, status, link_type,  } = event.queryStringParameters;        

        if(!page || !per_page) throw new BadRequestException('SCF.LIBERA.12');
        if(isNaN(+page) || isNaN(+per_page)) throw new BadRequestException('SCF.LIBERA.59');
        if(+page <= 0 || +per_page <= 0)  throw new BadRequestException('SCF.LIBERA.78');
        if(+per_page > 15) throw new BadRequestException('SCF.LIBERA.108');
        if((filter_by && filter_by === FilterEnterpriseRequestEnum.ENTERPRISE_NAME || filter_by && filter_by === FilterEnterpriseRequestEnum.DATE || filter_by && filter_by === FilterEnterpriseRequestEnum.NIT) && !q ) 
            throw new BadRequestException('SCF.LIBERA.15');
        if(filter_by && filter_by == FilterEnterpriseRequestEnum.DATE && !LiberaUtils.isValidFormatDate(q))
            throw new BadRequestException('SCF.LIBERA.41', {date: q});
        if(filter_by && !parseFilterEnterpriseRequest(filter_by)) throw new BadRequestException('SCF.LIBERA.13', {filter_by});
        if(status && !isEnterpriseRequestStatusValid(status)) throw new BadRequestException('SCF.LIBERA.75', {status});
        if(!request) throw new BadRequestException('SCF.LIBERA.107');
        if(request && !isEnterpriseRequestTypeValid(request)) throw new BadRequestException('SCF.LIBERA.76', {request});
        if(request && link_type && !isEnterpriseLinkTypeValid(link_type)) throw new BadRequestException('SCF.LIBERA.77', { type: link_type })

        const filter = new FilterEnterpriseRequests(+page, +per_page, request, filter_by, q, status, link_type);        
        const requests = await EnterpriseService.getEnterpriseRequests(filter);
        const result = requests.requests ? requests.requests : requests.doc;

        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Ok(result, {'X-Total-Count': requests.total});
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
            return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.READ_ENTERPRISE_LINKINGS_LIST
        ]
}));
