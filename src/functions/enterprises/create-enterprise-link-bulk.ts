const middy = require('middy');
import { APIGatewayProxyEvent, APIGatewayProxyHandler, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { EnterpriseService } from 'services/enterprise.service';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import Response from 'commons/response';



const originalHandler : APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        if(!event.body) throw new BadRequestException('SCF.LIBERA.97');
        const { enterpriseId } = event.pathParameters;
        if(!enterpriseId || enterpriseId === undefined) 
            throw new BadRequestException('SCF.LIBERA.48');
        const { enterpriseRequestBulkId, requests } = JSON.parse(event.body);
        if(!requests.length) throw new BadRequestException('SCF.LIBERA.98');
        const bulk = await EnterpriseService.createEnterpriseRequestBulk(+enterpriseId, +enterpriseRequestBulkId, requests);
        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.Created(bulk);
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