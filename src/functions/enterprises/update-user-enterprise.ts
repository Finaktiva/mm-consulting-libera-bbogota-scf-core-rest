import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from "aws-lambda";
import { authorizerRoles } from "commons/middlewares/authorizer-roles";
import { RoleEnum } from "commons/enums/role.enum";
import Response from "commons/response";
import { handleException, BadRequestException } from "commons/exceptions";
import { EnterpriseService } from "services/enterprise.service";
import { parseCatModule } from "commons/enums/cat-module.enum";
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context : Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        if(!event.body) throw new BadRequestException('SCF.LIBERA.49');
        const { enterpriseId, userId } = event.pathParameters;
        const { name, firstSurname, secondSurname, modules } = JSON.parse(event.body);

        if(isNaN(+enterpriseId) || !enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if(isNaN(+userId) || !userId || userId === undefined) throw new BadRequestException('SCF.LIBERA.51', { userId });
        if(!name || !firstSurname || !modules) throw new BadRequestException('SCF.LIBERA.52');
        if (modules && !modules.length) throw new BadRequestException('SCF.LIBERA.28', { modules });
        for(const mod of modules) {
            if(!parseCatModule(mod)) throw new BadRequestException('SCF.LIBERA.58', { module: mod });
        }

        await EnterpriseService.updateUserEnterpriseById(+enterpriseId, +userId, { name, firstSurname, secondSurname, modules });

        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.NoContent();
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN
        ]
    }));