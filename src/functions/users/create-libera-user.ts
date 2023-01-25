import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException, ConflictException } from 'commons/exceptions';
import { UserService } from 'services/user.service';
import LiberaUtils from 'commons/libera.utils';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {
        const requestBody = JSON.parse(event.body);
        const { email, name, firstSurname, secondSurname, roles } = requestBody;

        if(!email) throw new BadRequestException('SCF.LIBERA.05');
        if(LiberaUtils.checkString(name) || LiberaUtils.checkString(firstSurname) || LiberaUtils.checkString(secondSurname))
            throw new BadRequestException('SCF.LIBERA.229');
        if(roles && !roles.length) throw new BadRequestException('SCF.LIBERA.43', {roles});
        const result = await UserService.createLiberaUser(requestBody);

        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Created(result);
    }
    catch(errors) {
        console.log(`HANDLER ERROR: ${errors}`);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.MANAGE_BOCC_USERS
        ]
}));
