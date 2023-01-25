const middy = require('middy');
import { APIGatewayProxyHandler, Context, APIGatewayEvent } from "aws-lambda";
import { authorizerRoles } from "commons/middlewares/authorizer-roles";
import { RoleEnum } from "commons/enums/role.enum";
import { handleException, BadRequestException } from "commons/exceptions";
import Response from 'commons/response';
import { isCatModuleValid } from "commons/enums/cat-module.enum";
import { EnterpriseModuleService } from "services/enterprise-module.service";

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`Handler: Starting ${context.functionName}`);
    try {
        const { enterpriseId } = event.pathParameters;
        const { module, documentationId } = JSON.parse(event.body);

        const catModule = isCatModuleValid(module);
        if(!enterpriseId || enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if(module === undefined || !catModule) throw new BadRequestException('SCF.LIBERA.58', {module});
        if(!documentationId || documentationId === undefined || isNaN(+documentationId)) throw new BadRequestException('SCF.LIBERA.79',{ documentationId});
            
        await EnterpriseModuleService.sendModuleRequest(+enterpriseId, catModule, documentationId);
        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.NoContent();
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
        RoleEnum.LIBERA_COLLABORATOR
    ]
}));