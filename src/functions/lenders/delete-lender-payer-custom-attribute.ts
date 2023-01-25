import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import Response from 'commons/response';
import { LenderCustomAttributesService } from 'services/lender-custom-attributes.service';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName} method`);
    try {
        const lenderId = event.pathParameters['enterpriseId'] ? parseInt(event.pathParameters['enterpriseId']) : null;
        const payerId = event.pathParameters['payerId'] ? parseInt(event.pathParameters['payerId']) : null;
        const customAttributeId = event.pathParameters['customAttributeId'] ? parseInt(event.pathParameters['customAttributeId']) : null;

        if(!lenderId)
            throw new BadRequestException('SCF.LIBERA.198');

        if(!payerId)
            throw new BadRequestException('SCF.LIBERA.213');
        
        if(!customAttributeId)
            throw new BadRequestException('SCF.LIBERA.211');
        
        await LenderCustomAttributesService.deleteFundingLinkPayerLenderCustomAttribute(lenderId, payerId, customAttributeId);
        console.log(`HANDLER: Ending ${context.functionName} method`);
        return Response.NoContent();
    }
    catch (errors) {
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
    }));