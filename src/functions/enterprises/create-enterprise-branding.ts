import { authorizerRoles } from "commons/middlewares/authorizer-roles";
import { RoleEnum } from "commons/enums/role.enum";
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from "aws-lambda";
import Res from "commons/response";
import { handleException, BadRequestException } from "commons/exceptions";
import { EnterpriseService } from "services/enterprise.service";
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);
    try {
        const { enterpriseId } = event.pathParameters;

        const body = JSON.parse(event.body);
        if(!body) throw new BadRequestException('SCF.LIBERA.49');
        if(!body.primaryColor && !body.accentColor) throw new BadRequestException('SCF.LIBERA.68');
        if (!enterpriseId || enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        
        await EnterpriseService.createEnterpriseBranding(enterpriseId, body);
        console.log(`HANDLER: Ending ${context.functionName}`);
        return Res.Created({});
    }
    catch (errors) {
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