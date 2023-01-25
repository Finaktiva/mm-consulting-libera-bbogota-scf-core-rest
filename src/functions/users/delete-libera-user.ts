import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { BadRequestException, handleException } from 'commons/exceptions';
import { UserService } from 'services/user.service';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);
    try {
        if(!event.pathParameters) throw new BadRequestException('SCF.LIBERA.COMMON.400');
        const { userId } = event.pathParameters;
        if(!userId || userId === undefined || isNaN(+userId)) throw new BadRequestException('SCF.LIBERA.57');

        await UserService.deleteLiberaUserById(+userId);

        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.NoContent();
    } 
    catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.MANAGE_BOCC_USERS
        ]
}));
