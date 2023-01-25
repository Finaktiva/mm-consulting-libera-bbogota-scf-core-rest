const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import Response from 'commons/response';
import { EnterpriseService } from 'services/enterprise.service';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';

const originalHandler : APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    try {
        if(!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.17');
        const { q } = event.queryStringParameters;
        
        if(!q) throw new BadRequestException('SCF.LIBERA.15');

        const result = await EnterpriseService.getEnterpriseByNIT(q);

        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Ok(result);
    } catch (errors) {
        console.log('HANDLER ERRORS:', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_PAYER_ADMIN,
            RoleEnum.LIBERA_ADMIN
        ]
    }));
