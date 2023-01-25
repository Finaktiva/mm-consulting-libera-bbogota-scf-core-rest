const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException, ConflictException } from 'commons/exceptions';
import { EnterpriseService } from 'services/enterprise.service';
import Response from 'commons/response';
import LiberaUtils from 'commons/libera.utils';
import ValidatorUtilities from 'commons/utils/validator';
import { UserTypeEnum } from 'commons/enums/user-type.enum';
import { UserService } from 'services/user.service';
import { PermissionEnum } from 'commons/enums/permission.enum';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);
    try {
        const { enterpriseId } = event.pathParameters;
        const requestBody = JSON.parse(event.body);
        const userId = event.requestContext.authorizer.principalId;
        const { owner } = requestBody;
        if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        if(LiberaUtils.checkString(owner.name) || LiberaUtils.checkString(owner.firstSurname))
            throw new BadRequestException('SCF.LIBERA.229');
        
        if (owner.secondSurname) {
            if (LiberaUtils.checkString(owner.secondSurname)) throw new BadRequestException('SCF.LIBERA.229');
        }
        
        const userRol = await UserService.returnRolUser(userId);
        if(userRol == UserTypeEnum.LIBERA_USER){
            console.log('---> LIBERA USER firmed.');
            const validationReq: boolean = await ValidatorUtilities.updateEnterpriseRequestBodyValidator(requestBody);
            if (validationReq) {
                console.log("---> Validation success!!");
            } else {
                throw new BadRequestException('SCF.LIBERA.COMMON.400.01');
            }
        }

        await EnterpriseService.updateEnterpriseById(+enterpriseId, requestBody, userId);
        return Response.NoContent();
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.UPDATE_ENTERPRISE
        ]
    }));