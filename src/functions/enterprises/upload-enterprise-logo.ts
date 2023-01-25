const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { EnterpriseService } from 'services/enterprise.service';
import Response from 'commons/response';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {
        const { enterpriseId } = event.pathParameters;
        const { brandingLogoName, brandingFaviconName } = JSON.parse(event.body);
        if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        if(!brandingLogoName && !brandingFaviconName) throw new BadRequestException('SCF.LIBERA.69');
        const saveBranding = await EnterpriseService.moveLogoOrFaviconFromFolder(+enterpriseId, {brandingLogoName, brandingFaviconName});
        return Response.Created(saveBranding);
    } catch (errors) {
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
    