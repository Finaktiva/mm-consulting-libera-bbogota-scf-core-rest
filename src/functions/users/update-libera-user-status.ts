const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from "aws-lambda";
import Response from "commons/response";
import { handleException, BadRequestException } from "commons/exceptions";
import { UserService } from "services/user.service";
import { isValidStatus } from "commons/enums/user-status.enum";
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';

const originalHandler : APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        const { userId } = event.pathParameters;
        const { status } = JSON.parse(event.body);
        if(!userId)
            throw new BadRequestException('SCF.LIBERA.57');
        if(userId && userId === undefined || userId && isNaN(+userId))
            throw new BadRequestException('SCF.LIBERA.51', {userId});
        if(!status) throw new BadRequestException('SCF.LIBERA.31');
        if(!isValidStatus(status))
            throw new BadRequestException('SCF.LIBERA.32');
        await UserService.liberaUserUpdateStatus(+userId, status);
        return Response.NoContent();
    } catch (errors) {
        console.log('HANDLER ERROR: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.ENABLE_OR_DISABLE_BOCC_USER
        ]
}));
