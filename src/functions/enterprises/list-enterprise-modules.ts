import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException } from 'commons/exceptions';
import { EnterpriseService } from 'services/enterprise.service';
import Response from 'commons/response';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
const middy = require('middy');

export const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context : Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        const enterpriseId = +event.pathParameters['enterpriseId'];

        const modulesEnterprise = await EnterpriseService.getModulesByEnterprise(enterpriseId);
        
        console.log(`HANDLER: Ending ${context.functionName} method...`);
        return Response.Ok(modulesEnterprise);
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