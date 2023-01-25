import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import Response from 'commons/response';
import { LenderCustomAttributesService } from 'services/lender-custom-attributes.service';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName} method`);
    try {
        const lenderId = event.pathParameters['enterpriseId'] ? parseInt(event.pathParameters['enterpriseId']) : null;
        const customAttributeId = event.pathParameters['customAttributeId'] ? parseInt(event.pathParameters['customAttributeId']) : null;

        if(!lenderId)
            throw new BadRequestException('CF.LIBERA.29');

        if(!customAttributeId)
            throw new BadRequestException('SCF.LIBERA.211');
        
        console.log(`HANDLER: Ending ${context.functionName} method`);
        await LenderCustomAttributesService.deleteCustoAttribute(lenderId, customAttributeId);
        return Response.NoContent();
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
            RoleEnum.ENTERPRISE_FUNDING_ADMIN
        ]
    }))