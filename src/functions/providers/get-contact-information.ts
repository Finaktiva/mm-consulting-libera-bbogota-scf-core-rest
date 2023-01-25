import { APIGatewayProxyHandler, Context, APIGatewayProxyEvent } from 'aws-lambda';
import { RoleEnum } from 'commons/enums/role.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import Response from 'commons/response';
import { ProviderService } from 'services/provider.service';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`Handler: Starting ${context.functionName} `);
    try {
        const {enterpriseId} = event.pathParameters;
        const {page, per_page} = event.queryStringParameters || {};

        if(isNaN(+enterpriseId))
            throw new BadRequestException('SCF.LIBERA.406');

        if(!page || !per_page)
            throw new BadRequestException('SCF.LIBERA.12');

        if(isNaN(+page) || +page <= 0 || isNaN(+per_page) || +per_page <= 0)
            throw new BadRequestException('SCF.LIBERA.78');

        const response = await ProviderService.getContactInformation(+enterpriseId, +page, +per_page);

        console.log(`Handler: Ending ${context.functionName} `);
        return Response.Ok(response.users, {'X-Total-Count': response.total});
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
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