import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from "aws-lambda";
import { BadRequestException, handleException, ConflictException } from "commons/exceptions";
import { UserService } from "services/user.service";
import Response from "commons/response";
import LiberaUtils from "commons/libera.utils";
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context : Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        if(!event.body) throw new BadRequestException('SCF.LIBERA.49');
        const { userId } = event.pathParameters;
        const { name, firstSurname, secondSurname, roles, bankRegions } = JSON.parse(event.body);

        if(!userId || userId === undefined || isNaN(+userId)) throw new BadRequestException('SCF.LIBERA.51', { userId });
        if(LiberaUtils.checkString(name) || LiberaUtils.checkString(firstSurname) || LiberaUtils.checkString(secondSurname))
            throw new BadRequestException('SCF.LIBERA.229');
        //if(roles && roles != RoleEnum.LIBERA_ADMIN) throw new ConflictException('SCF.LIBERA.54', { roles });
        if(roles){
            if(roles.length < 1)
                throw new BadRequestException('SCF.LIBERA.343');
        } else {
            throw new BadRequestException('SCF.LIBERA.343');
        }

        if(!bankRegions)
            throw new BadRequestException('SCF.LIBERA.394');
        
        if(!Array.isArray(bankRegions))
            throw new BadRequestException('SCF.LIBERA.395');
        
        bankRegions.forEach(br => {
            if(!br.id || isNaN(br.id) || !br.description)
                throw new BadRequestException('SCF.LIBERA.396');
        });
        
        await UserService.updateLiberaUserById(+userId, { name, firstSurname, secondSurname, roles, bankRegions });

        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.NoContent();
    } catch (errors) {
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
