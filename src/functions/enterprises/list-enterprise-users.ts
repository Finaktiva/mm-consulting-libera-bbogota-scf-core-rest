import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from "aws-lambda";
import { handleException, BadRequestException } from "commons/exceptions";
import { authorizerRoles } from "commons/middlewares/authorizer-roles";
import { RoleEnum, parseUserRole } from "commons/enums/role.enum";
import { FilterEnterpriseEnum, isFilterEnterpriseValid } from "commons/enums/filter-by.enum";
import { FilterEnterprises } from "commons/filter";
import { EnterpriseService } from "services/enterprise.service";
import { parseCatModule } from "commons/enums/cat-module.enum";
import { isListEnterpriseUserValidStatus } from "commons/enums/user-status.enum";
import Respose from "commons/response";
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {
        if(!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.17');

        const { enterpriseId } = event.pathParameters;
        const { page, per_page, filter_by, q } = event.queryStringParameters;

        if(!enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if(isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if(!page || !per_page) throw new BadRequestException('SCF.LIBERA.12');
        if(isNaN(+page) || isNaN(+per_page)) throw new BadRequestException('SCF.LIBERA.59');
        if(filter_by && !q) throw new BadRequestException('SCF.LIBERA.15');
        if(filter_by && !isFilterEnterpriseValid(filter_by)) throw new BadRequestException('SCF.LIBERA.13', {filter_by});
        if(filter_by && filter_by == FilterEnterpriseEnum.ROLE && !parseUserRole(q)) throw new BadRequestException('SCF.LIBERA.43');
        if(filter_by && filter_by == FilterEnterpriseEnum.MODULE && !parseCatModule(q)) throw new BadRequestException('SCF.LIBERA.44');
        if(filter_by && filter_by == FilterEnterpriseEnum.STATUS && !isListEnterpriseUserValidStatus(q)) throw new BadRequestException('SCF.LIBERA.39', {status: q});

        const filter = new FilterEnterprises(+page, +per_page, filter_by, null, q);
        const users = await EnterpriseService.getUsersByEnterpriseId(+enterpriseId, filter);

        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Respose.Ok(users.users,{'X-Total-Count': users.total} );
    }
    catch(errors) {
        console.log(`HANDLER ERROR: ${errors}`);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN
        ]
    }));