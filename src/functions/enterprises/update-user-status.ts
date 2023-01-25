const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from "aws-lambda";
import { BadRequestException, handleException } from "commons/exceptions";
import Response from 'commons/response';
import { authorizerRoles } from "commons/middlewares/authorizer-roles";
import { RoleEnum } from "commons/enums/role.enum";
import { UserService } from "services/user.service";
import { isValidStatus } from "commons/enums/user-status.enum";

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context : Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        const { enterpriseId, userId } = event.pathParameters;
        const { status } = JSON.parse(event.body);

        if(!enterpriseId || enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if(!userId || userId === undefined || isNaN(+userId)) throw new BadRequestException('SCF.LIBERA.51', { userId });
        if(!status || status === undefined || !isValidStatus(status)) throw new BadRequestException('SCF.LIBERA.39', { status });
        
        await UserService.updateUserStatusById(+enterpriseId, +userId, status);
        
        console.log(`HANDLER: Ending ${context.functionName}`);
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
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN
        ]
    }));