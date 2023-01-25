import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
const middy = require('middy');
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { parseLenderCustomAttributesOrderBy } from 'commons/filter';
import { LenderCustomAttributesService } from 'services/lender-custom-attributes.service';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Staring ${context.functionName} method`);
    try {
        const lenderId = event.pathParameters['enterpriseId'] ? parseInt(event.pathParameters['enterpriseId']) : null;
        const orderBy = event.queryStringParameters ? parseLenderCustomAttributesOrderBy(event.queryStringParameters['order_by']) : 'ASC';
        if(!lenderId)
            throw new BadRequestException('SCF.LIBERA.29');

        if(orderBy == 'INVALID')
            throw new BadRequestException('SCF.LIBERA.141', { order_by: event.queryStringParameters['order_by']});

        const result = await LenderCustomAttributesService.getLenderCustomAttributes(lenderId, orderBy);
        console.log(`HANDLER: Ending ${context.functionName} method`);
        return Response.Ok(result);
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