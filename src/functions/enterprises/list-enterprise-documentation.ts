const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { EnterpriseService } from 'services/enterprise.service';
import Response from 'commons/response';
import { isBoolean, isNumber, isObject, isString } from 'util';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName} method...`);
    try {
        const enterpriseId = +event.pathParameters['enterpriseId'];
        const userId = +event.requestContext.authorizer['principalId'];
        const all = event.queryStringParameters && event.queryStringParameters['all'] && event.queryStringParameters['all'] === 'true'
            ? true : event.queryStringParameters && event.queryStringParameters['all'] && event.queryStringParameters['all'] === 'false'
            ? false : !event.queryStringParameters ? false : !event.queryStringParameters['all'] ? false : event.queryStringParameters['all']; 
        if(!isBoolean(all)) 
            throw new BadRequestException('SCF.LIBERA.60');
        console.log(`qsparam - all - : ${all}`);
        const enterpriseDocumentation = await EnterpriseService
            .getEnterpriseDocumentationByEnterpriseId(enterpriseId, userId, all); 
        console.log(`HANDLER: Ending ${context.functionName} method...`);
        return Response.Ok(enterpriseDocumentation);
    }
    catch(errors) {
        console.log('HANDLER ERRORS ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.READ_ENTERPRISE_DOCUMENTATION
        ]
    }));

    