import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { handleException, BadRequestException } from 'commons/exceptions';
import Response from 'commons/response';
import { LenderCustomAttributesService } from 'services/lender-custom-attributes.service';
import { ICustomAttribute } from 'commons/interfaces/custom-attribute.interface';
import { CustomAttributesTypeEnum } from 'commons/enums/custom-attributes-type.enum';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName} method`);
    try {
        const lenderId = event.pathParameters['enterpriseId'] ? parseInt(event.pathParameters['enterpriseId']) : null;
        const customAttributeData: ICustomAttribute = <ICustomAttribute>JSON.parse(event.body);
        const userId = event.requestContext.authorizer.principalId;
        customAttributeData.userId = userId;
        if(!lenderId)
            throw new BadRequestException('SCF.LIBERA.29');

        if((customAttributeData.type == CustomAttributesTypeEnum.CHECKBOX 
                || customAttributeData.type == CustomAttributesTypeEnum.RADIO)
                && !customAttributeData.options.length)
            throw new BadRequestException('SCF.LIBERA.205', { type: customAttributeData.type });
        
        const customAttributeCreated = await LenderCustomAttributesService.createCustomAttribute(lenderId, customAttributeData);
        console.log(`HANDLER: Ending ${context.functionName} method`);
        return Response.Created(customAttributeCreated);
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
    }));