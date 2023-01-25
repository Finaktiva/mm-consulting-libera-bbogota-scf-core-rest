const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { EnterpriseService } from 'services/enterprise.service';
import { SimpleFilter } from 'commons/filter';
import Response from 'commons/response';

const originalHandler : APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        if(!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.12')
        const { enterpriseId } = event.pathParameters;
        const { page, per_page } = event.queryStringParameters;

        if(!enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if(isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if(!page || !per_page) throw new BadRequestException('SCF.LIBERA.12');
        if(isNaN(+page) || isNaN(+per_page)) throw new BadRequestException('SCF.LIBERA.59');
        if(+page <= 0 || +per_page <= 0)  throw new BadRequestException('SCF.LIBERA.78');

        const filter = new SimpleFilter(+page, +per_page); 
        const bulks = await EnterpriseService.getEnterpriseProvidersBulk(+enterpriseId, filter);

        return Response.Ok(bulks.response, {'X-Total-Count': bulks.total})
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_PAYER_ADMIN
        ]
    }));
    