const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { handleException, BadRequestException } from 'commons/exceptions';
import { isValidCustomAttributesType } from 'commons/enums/custom-attributes-type.enum';
import { EnterpriseService } from 'services/enterprise.service';
import Response from 'commons/response';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);
    try {
        if(!event.body)
            throw new BadRequestException('SCF.LIBERA.112');
        const { enterpriseId } = event.pathParameters;
        if(!enterpriseId || enterpriseId === undefined) 
            throw new BadRequestException('SCF.LIBERA.48');
        const { name, type } = JSON.parse(event.body);
        if(!type || type && !isValidCustomAttributesType(type))
            throw new BadRequestException('SCF.LIBERA.88', {type});
        const cAttributes = await EnterpriseService.createEnterpriseCustomAttributes(+enterpriseId, {name, type});
        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.Created(cAttributes);
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN,
            RoleEnum.ENTERPRISE_PAYER_ADMIN
        ]
    }));

