import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { BadRequestException, handleException } from 'commons/exceptions';
import Res from 'commons/response';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
const middy = require('middy');
import { EnterpriseService } from 'services/enterprise.service';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context : Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        const { enterpriseId } = event.pathParameters;

        if(!enterpriseId || enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        
        const result = await EnterpriseService.getEnterpriseBranding(+enterpriseId);

        console.log(`HANDLER: Ending ${context.functionName}`);
        return Res.Ok(result);
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
            RoleEnum.ENTERPRISE_FUNDING_ADMIN,
            RoleEnum.ENTERPRISE_PAYER_ADMIN,
            RoleEnum.ENTERPRISE_PROVIDER_ADMIN
        ]
    }));