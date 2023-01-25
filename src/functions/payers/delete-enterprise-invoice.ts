const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { EnterpriseService } from 'services/enterprise.service';
import Response from 'commons/response';
import { RoleEnum } from 'commons/enums/role.enum';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        if(!event.pathParameters) throw new BadRequestException('SCF.LIBERA.126');
        const { enterpriseId, invoiceId } = event.pathParameters;
        if(!invoiceId) throw new BadRequestException('SCF.LIBERA.124');
        if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');

        await EnterpriseService.deleteInvoice(+enterpriseId, +invoiceId);
        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.NoContent();
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({ roles: [RoleEnum.ENTERPRISE_CONSOLE_ADMIN, RoleEnum.ENTERPRISE_PAYER_ADMIN] }));