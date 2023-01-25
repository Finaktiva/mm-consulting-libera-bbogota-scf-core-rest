import { APIGatewayProxyEvent, APIGatewayProxyHandler, Context } from 'aws-lambda';
import { RoleEnum } from 'commons/enums/role.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import { IUpdateFundingLinkPayerLenderCustomAttribute } from 'commons/interfaces/update-funding-link-payer-lender-custom-attribute.interface';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import Response from 'commons/response';
import { LenderCustomAttributesService } from 'services/lender-custom-attributes.service';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName} method`);
    try {
        const lenderId = event.pathParameters['enterpriseId'] ? parseInt(event.pathParameters['enterpriseId']) : null;
        const payerId = event.pathParameters['payerId'] ? parseInt(event.pathParameters['payerId']) : null;
        const requestBody: IUpdateFundingLinkPayerLenderCustomAttribute[] = JSON.parse(event.body);
        const userId = +event.requestContext.authorizer.principalId;

        if (!lenderId)
            throw new BadRequestException('SCF.LIBERA.198');

        if (!payerId)
            throw new BadRequestException('SCF.LIBERA.213');

        if (!requestBody.length)
            throw new BadRequestException('SCF.LIBERA.COMMON.400.01');

        const customAttributes = await LenderCustomAttributesService
            .updateFundingLinkPayerLenderCustomAttribute(lenderId, payerId, userId, requestBody);

        console.log(`HANDLER: Ending ${context.functionName} method`);

        return Response.Created(customAttributes);
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